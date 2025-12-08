import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SpacexService {
  private readonly baseUrl = 'https://api.spacexdata.com/v4/launches';

  constructor(private readonly httpService: HttpService) {}

  async findAll(page: number = 1, limit: number = 10) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/query`, {
          query: {},
          options: {
            page,
            limit,
            sort: { date_utc: 'desc' },
            select: ['name', 'date_utc', 'success', 'links.patch.small', 'rocket', 'details']
          }
        })
      );
      
      const launches = data.docs.map((launch: any) => ({
        id: launch.id,
        mission_name: launch.name,
        date: launch.date_utc,
        success: launch.success,
        image: launch.links.patch.small || null,
        details: launch.details || 'Sem detalhes.',
        rocket_id: launch.rocket || null,
        failures: launch.failures || [],
        video_link: launch.links.webcast || null,
        article_link: launch.links.article || null,
      }));

      return {
        total: data.totalDocs,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        data: launches,
      };

    } catch (error) {
      throw new HttpException('Erro ao buscar lançamentos da SpaceX', HttpStatus.BAD_GATEWAY);
    }
  }

  async findOne(id: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/${id}`)
      );

      return {
        id: data.id,
        mission_name: data.name,
        date: data.date_utc,
        success: data.success,
        details: data.details,
        image: data.links.patch.large,
        video_link: data.links.webcast,
        article_link: data.links.article,
        rocket_id: data.rocket,
        failures: data.failures
      };

    } catch (error) {
      throw new HttpException('Lançamento não encontrado', HttpStatus.NOT_FOUND);
    }
  }
}