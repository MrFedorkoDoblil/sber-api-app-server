import { HttpService } from '@nestjs/axios';
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { configuredHttpsAgent } from './main';
import { catchError, map } from 'rxjs/operators';
import { AxiosError } from 'axios';

@Injectable()
export class AppService {

  constructor(private readonly httpService: HttpService) {}

  getHello(): string {
    return 'SBB_API_SERVER';
  }

  async test(){
    console.log("__TEST__")
    try { 
      return await this.httpService.get(
        'https://edupirfintech.sberbank.ru:9443/fintech/api/v1/client-info', 
        {
          httpsAgent: configuredHttpsAgent,
          headers: {
            'Authorization': "Bearer 123"
          },
          timeout:600000,
        }
      )
      .pipe(
        map((res) => res.data),
      )
      .pipe(
        catchError((error: AxiosError) => {
          console.log(error.cause)
          console.log(error.code)
          console.log(error.message)
          console.log(error.response.status)
          console.log(error.response.data)
          throw new ForbiddenException('API not available');
        }),
      );
      
    } catch (error) {
      console.log({
        message: error.message,
        code: error.code,
        name: error.name,

      })
      switch (error.code) {
        case 'ECONNABORTED':
          throw new BadRequestException({
            cause: error.message,
            code: error.code,
          })
        case 'ETIMEDOUT':
          throw new BadRequestException({
            cause: error.message,
            code: error.code,
          })      
        default:
          throw new InternalServerErrorException({
            cause: error.message,
            code: error.code,
          });
      }
    }
  }
  
}
