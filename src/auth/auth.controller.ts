import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Post,  Query,  Redirect } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import * as dotenv from 'dotenv'
dotenv.config();

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ){}
    
    @HttpCode(200)
    @Post()
    async login(@Body() body: AuthDto){
        return await this.authService.auth(body)
    }


    @Get('sbid')
    @Redirect(process.env.SB_ID_AUTH_URL, 302)
    async redirect(){
        const url = await this.authService.getAuthRequestParams();
        if(!url) throw new BadRequestException();
        console.log(url);
        return({url})
    }

    @Get('sbid/login')
    async getToken(@Query('code') code: string, @Query('state') state: string){
        return await this.authService.sberBusinessIdAuth(code, state)
    }    
    @Get('sid')
    async getSids(){
        return await this.authService.getsids()
    }    
    @Delete('sid')
    async deletesids(){
        return await this.authService.deletesids()
    }    
}


