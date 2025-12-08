import { ForbiddenException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService implements OnModuleInit {

  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService
  ) {}

   async onModuleInit() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || 'admin@example.com';
    const adminPass = this.configService.get<string>('ADMIN_PASSWORD') || '123456';
    const adminName = 'Admin GDASH';

    if (!adminEmail || !adminPass) {
      this.logger.error('❌ Variáveis de ambiente ADMIN_EMAIL ou ADMIN_PASSWORD não definidas!');
      return;
    }

    try {
      const userExists = await this.userModel.findOne({ email: adminEmail, deletedAt: null });

      if (!userExists) {
        this.logger.log(`⚙️ Criando admin padrão: ${adminEmail}`);
        
        await this.create({
          email: adminEmail,
          password: adminPass,
          name: adminName,
          role: UserRole.ADMIN,
        });
        
        this.logger.log('✅ Admin criado com sucesso.');

        return;
      }
      
      this.logger.log(' ℹ️ Admin já existe, pulando criação.');
    } catch (error) {
      this.logger.error(`❌ Erro ao criar admin: ${error.message}`);
    }
  }

  async create(data: CreateUserDto) {
    
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.userModel.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      deletedAt: null,
      role: data.role || UserRole.USER,
    });
  }

  async findAll() {
    return this.userModel.find({ deletedAt: null }).select('-password').exec();
  }

  async findOneById(id: string) {
    const user = await this.userModel.findOne({ _id: id, deletedAt: null });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async findOne(email: string) {
    return this.userModel.findOne({ email, deletedAt: null });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    
    const userToUpdate = await this.userModel.findById(id);
    
    if (!userToUpdate) throw new NotFoundException('Usuário não encontrado');
    
    if (userToUpdate.email === adminEmail) {
        throw new ForbiddenException('O Administrador Root não pode ser modificado via painel.');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).select('-password');
  }

  async remove(id: string) {

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

    const user = await this.userModel.findById(id);
    
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    if (user.email === adminEmail) {
      throw new ForbiddenException('Não é permitido excluir o Administrador Root do sistema.');
    }

    return this.userModel.findByIdAndUpdate(id, { deletedAt: new Date() });
  }
}
