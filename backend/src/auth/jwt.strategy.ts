import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'defaultSecretKey',
        });
    }

    async validate(payload: any) {

        console.log(payload.sub);
        
        const user = await this.usersService.findOneById(payload.sub).catch(() => null);

        if (!user) {
            throw new UnauthorizedException('Usuário não encontrado ou inativo.');
        }

        return { userId: payload.sub, email: payload.email, name: payload.name };
    }
}