import { HttpService } from '@nestjs/axios';
import { BadRequestException, ForbiddenException, HttpException, Injectable, UnauthorizedException} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import {  AxiosError, AxiosRequestConfig } from 'axios';
import { Model } from 'mongoose';
import { firstValueFrom, lastValueFrom,  } from 'rxjs';
import { configuredHttpsAgent } from 'src/main';
import { User } from 'src/schemas/user.schema';
import { PathTree, sbbAuthTree, sbbFintechTree } from 'libs/sbbApiEndpoints';

@Injectable()
export class GlobalService {

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ){}

    getSbbUrl(str: string){
        return this.getUrl(str, sbbAuthTree)
    }

    getFintechUrl(str: string){
        return this.getUrl(str, sbbFintechTree)
    }

    private getUrl(str: string, tree: PathTree){
        if(!str || !tree.base.url) return ''
        const points = str.split('.')
        const resultArray = [tree.base.url,]
        let current = tree.base
        if(!current) return ''
    
    
        points.forEach((item) => {
            if(current?.children){
                const hasItem = current.children.find(child => child[item]);
                if(hasItem) {
                    current = hasItem[item]
                    resultArray.push(current.url);
                }
            } else{
                resultArray.push (current[item]?.url)
            }
        })
        return resultArray.join('')
    } 

    async checkUserBySub(user: {sub: string}){
        const foundUser = await this.userModel.findOne({sub: user.sub});
        if(!foundUser) throw new UnauthorizedException('Token validation failed')
        const token =  foundUser.sbbAccessToken;
        if(!token) throw new ForbiddenException()
        return token
    }


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

        try {
            let responseData: Record<string, any> | undefined
        const user = await this.userModel.findOne({sbbAccessToken: accessToken});
        if(!user) throw new UnauthorizedException();
        const refreshToken = user.sbbRefreshToken
        await lastValueFrom(this.httpService[method](...([...handleOptions(accessToken)] as [string, any, any])))
        .then(res => {
            responseData = res.data

        })
        .catch(async (error: AxiosError) => {
            if(!error?.response?.status) {
                throw  new BadRequestException;
            }else 
            if([401, 403].includes(error.response.status)){
                await lastValueFrom(this.httpService.post(
                    this.getSbbUrl('auth.token'),
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
            )
            .then(async refreshRes => {
                const {access_token, refresh_token} = refreshRes.data;
                user.sbbAccessToken = access_token;
                user.sbbRefreshToken = refresh_token;
                await user.save();
                await firstValueFrom(this.httpService[method](...([...handleOptions(access_token)] as [string, any, any])))
                .then(retryRes => {
                    responseData = retryRes.data
                })
                .catch((error: AxiosError) => {
                  throw  new HttpException(error.response.data, error.response.status)
                })
            })
            .catch((error: AxiosError) => {
                throw new HttpException(error.response.data, error.response.status)
            })     
        } else {
            throw  new HttpException(error.response.data, error.response.status)
        }
    })
        return responseData
        } catch (error) {
            throw error
        }
   
    }  
}

