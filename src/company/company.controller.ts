import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
    
    constructor(
        private readonly companyService: CompanyService
    ){}

    @UseGuards(AuthGuard)
    @Get()
    async getCompanyInfo(@Request() req){
        return await this.companyService.getCompany(req.user)
    }

}
