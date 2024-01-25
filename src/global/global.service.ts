import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class GlobalService {

    constructor(
        private readonly configService: ConfigService
    ){}

    async reauthSbRequest(
        accessToken: string,
        method: 'get' | 'post' | 'patch' | 'put' | 'delete',
        data: any,
        config: AxiosRequestConfig<any>
    ){
        
    }
}
