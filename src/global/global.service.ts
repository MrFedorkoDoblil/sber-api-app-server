import { HttpService } from '@nestjs/axios';
import { BadRequestException, HttpException, Injectable, UnauthorizedException} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { Model } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { configuredHttpsAgent } from 'src/main';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class GlobalService {

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ){}


    /**
     * The `reauthSbRequest` function is an asynchronous function that handles HTTP requests with
     * access token authentication and handles token refresh if the request returns a 401 or 403 status
     * code.
     * @param {'get' | 'head' | 'post' | 'put' | 'patch' | 'delete'} method - The HTTP method to be
     * used for the request. 
     * @param {string} url - The URL of the API endpoint you want to make a request to.
     * @param {string} accessToken - The `accessToken` parameter is a string that represents the access
     * token used for authentication.
     * @param [headers] - The `headers` parameter is an optional object that contains additional
     * headers to be included in the HTTP request. 
     * @param {any} [data] - The `data` parameter is an optional parameter that represents the payload
     * or body of the HTTP request. 
     * @returns The function `reauthSbRequest` returns an Observable that emits the data from the HTTP
     * response.
     */
    async reauthSbRequest(
        method: 'get' | 'head' | 'post' | 'put' | 'patch' | 'delete',
        url: string,
        accessToken: string,
        headers?: Record<string, string>,
        data?: any
        ){
        
        const handleOptions = 
        (accessToken: string) : 
        [string, AxiosRequestConfig<any>] |
        [string, any, AxiosRequestConfig<any>]  => {
            if(method === 'head' || method === 'get'){
                return [
                    url,
                    {
                        httpsAgent: configuredHttpsAgent,
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            ...headers
                            
                        },
                    }
                ]
            } else {
                return [
                    url, 
                    data, 
                    {
                        httpsAgent: configuredHttpsAgent,
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            ...headers
                        },
                    }
                ]
            }
        }

        const user = await this.userModel.findOne({sbbAccessToken: accessToken});
        if(!user) throw new UnauthorizedException();
        const refreshToken = user.sbbRefreshToken

        return this.httpService[method](...([...handleOptions(accessToken)] as [string, any, any]))
        .pipe(
            map((res) => res.data),
            catchError((error: AxiosError) => {
                if(!error.response) throw new BadRequestException()
                const {status: es, data} = error.response;
                if(es === 401 || es === 403){
                    return this.httpService.post(
                        this.configService.get('SB_ID_TOKEN_URL'),
                        {
                            grant_type: 'refresh_token',
                            client_id: this.configService.get('SB_ID_AUTH_CLIENT_ID'),
                            refresh_token: refreshToken,
                            client_secret: this.configService.get('SB_ID_CLIENT_SECRET'),
                        },
                        {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            httpsAgent: configuredHttpsAgent,
                        }
                        )
                    }
                throw new HttpException(data, es)
            }),
            catchError((error: AxiosError) => {
                if(!error.response) throw new BadRequestException()
                const {data} = error.response;
                throw new BadRequestException(data)
            }),
            map(async res => {
                if(!res.data){
                    throw new BadRequestException()
                }
                const {access_token, refresh_token} = res.data;
                if(!access_token || !refresh_token) throw new UnauthorizedException();
                user.sbbAccessToken = access_token;
                user.sbbRefreshToken = refresh_token;
                user.sbbReserveRefreshToken = refreshToken;
                await user.save();

                const response = this.httpService[method](...([...handleOptions(access_token)] as [string, any, any]))
                return lastValueFrom(response)
                .then(res=> res.data)
                .catch((error: AxiosError) => {
                    throw new HttpException(error.message, 400)
                })
            })
        )   
    }  
}

