import { Injectable } from '@nestjs/common';

import { GlobalService } from 'src/global/global.service';


@Injectable()
export class AccountService {
  constructor(
    private readonly globalService: GlobalService,
  ){}

  async getTransactions(accNumber: string, date: string, page: string, user: {sub: string, sbbAccessToken: string}){
    const { sbbAccessToken } = user;
    const generateQueryParams =  () => {
      return `?accountNumber=${accNumber}&statementDate=${date}&page=${page}`
    }
    try {
      const response =  await this.globalService.reauthSbRequest(
        'get',
        this.globalService.getFintechUrl('account.transactions')+generateQueryParams(),
        sbbAccessToken,
        {
          'Content-type': 'application/json;charset=utf-8'
        }
      )
      return response
    } catch (error) {
      throw error
    }
  }
}
