import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { configuredHttpsAgent } from './main';

@Injectable()
export class AppService {

  constructor(private readonly httpService: HttpService) {}

  getHello(): string {
    return 'SBB_API_SERVER';
  }

  async test(){
    console.log("__TEST__")
    try {
      
      return this.httpService.get('https://edupirfintech.sberbank.ru:9443/fintech/api/v1/client-info', {
        httpsAgent: configuredHttpsAgent,
        headers: {
          'Authorization': "Bearer 123"
        }
      })
    } catch (error) {
      console.log("__CATCH_SCOPE__")
      console.log(error)
      return error
    }
  }
  
}
