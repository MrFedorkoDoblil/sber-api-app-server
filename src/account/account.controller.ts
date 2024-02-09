import { Controller, Get, Query, Req, UseGuards, } from '@nestjs/common';
import { AccountService } from './account.service';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @UseGuards(AuthGuard)
  @Get('')
  async findAll(
    @Query('accountNumber') accountNumber: string, 
    @Query('statementDate') statementDate: string,
    @Query('page') page: string,
    @Req() req: {user: {sub: string, sbbAccessToken: string}},
    ){
    return await this.accountService.getTransactions(
      accountNumber,
      statementDate,
      page,
      req.user,
    );
  }
  async getTransactionOperations(
    @Query('accountNumber') accountNumber: string, 
    @Query('operationDate') operationDate: string,
    @Query('id') id: string,
    @Req() req: {user: {sub: string, sbbAccessToken: string}},
    ){
    return await this.accountService.getTransactionOperations(
      accountNumber,
      id,
      operationDate,
      req.user,
    );
  }
}
