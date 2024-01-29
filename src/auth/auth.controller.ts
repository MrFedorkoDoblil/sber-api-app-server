import { BadRequestException, Body, Controller, Get, HttpCode, Post,  Query,  Redirect, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import * as dotenv from 'dotenv'
import { Response, Request } from 'express';
import { configuredHttpsAgent } from 'src/main';
dotenv.config();

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ){}
    
    @HttpCode(200)
    @Post()
    async login(@Body() body: AuthDto, @Res({passthrough: true}) res: Response){
        return await this.authService.auth(body, res)
    }

    @Get('refresh')
    async refresh(@Req() req: Request){
        console.log('here');
        return this.authService.refresh(req)
    }

    @Get('sbid')
    @Redirect('', 302)
    async redirect(){
        const url = await this.authService.getAuthRequestParams();
        if(!url) throw new BadRequestException();
        console.log(url);
        return({url, secureProtocol: 'SSLv3_method', httpsAgent: configuredHttpsAgent})
    }

    @Get('sbid/login')
    async getToken(@Query('code') code: string, @Query('state') state: string){
        return await this.authService.sberBusinessIdAuth(code, state)
    }     
}


