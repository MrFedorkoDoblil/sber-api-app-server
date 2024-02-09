import { Injectable } from '@nestjs/common';

import { GlobalService } from 'src/global/global.service';

type ResUser=  {
  sub: string;
  sbbAccessToken: string;
}

@Injectable()
export class AccountService {
  constructor(
    private readonly globalService: GlobalService,
  ){}

  async getTransactions(accNumber: string, date: string, page: string, user: ResUser){
    const { sbbAccessToken } = user;
    const generateQueryParams =  () => {
      return `?accountNumber=${accNumber}&statementDate=${date}&page=${page}`
    }
    try {
      const response =  await this.globalService.reauthSbRequest(
        'get',
        this.globalService.getFintechUrl('account.transactionId')+generateQueryParams(),
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

  /**
   * The function `getTransactionOperations` retrieves transaction operations for a specific account
   * based on the account number, ID, and date.
   * @param {string} accNumber - The `accNumber` parameter is a string that represents the account
   * number for which you want to retrieve transaction operations.
   * @param {string} id - The `id` parameter is a string that represents the transaction ID. It is used
   * to uniquely identify a specific transaction.
   * @param {string} date - The `date` parameter is a string representing the operation date of the
   * transaction.
   * @param {ResUser} user - The `user` parameter is an object of type `ResUser` which contains
   * information about the user. It includes properties such as `sbbAccessToken`, which is used
   * for authentication purposes.
   * @returns the response from the API call made using the `globalService.reauthSbRequest` method.
   */
  async getTransactionOperations(accNumber: string, id:string, date: string, user: ResUser) {
    const {sbbAccessToken} = user;
    const generateQueryParams =  () => {
      return `?id=${id}&accountNumber=${accNumber}&operationDate=${date}`
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
