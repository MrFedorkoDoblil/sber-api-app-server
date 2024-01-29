import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { AuthDto } from './dto/auth.dto';
import { Sid } from 'src/schemas/sid.schema';
import { customAlphabet } from 'nanoid';
import { SbUser } from './types/sbUser';
import { schemaHas } from 'src/services/schemaHas';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { configuredHttpsAgent } from 'src/main';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';


@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userModel:Model<User>,
        @InjectModel(Sid.name) private readonly sidModel: Model<Sid>,
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly jwtService: JwtService,
    ){}

    async auth(body: AuthDto, res){
        const {login, password} = body;
        const user = await this.userModel.findOne({login})
        if (!user) throw new NotFoundException();
        const isPassword = password === user.password;
        if(!isPassword) throw new UnauthorizedException()
        const accessToken = await this.jwtService.sign(
            {
                sub: user.sub
            },
            {
                expiresIn: +this.configService.get('JWT_ACCESS_EXPIRES'),
                secret: this.configService.get('JWT_ACCESS_SECRET'),
            },
        )
        const refreshToken = await this.jwtService.sign(
            {
                sub: user.sub
            },
            {
                expiresIn: +this.configService.get('JWT_REFRESH_EXPIRES'),
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            },
        )
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            maxAge: 3600000,
            secure: true,
        })
        user.refreshToken = refreshToken;
        await user.save();
        return({accessToken})
    }

    async refresh(req: Request){
        const refreshToken = req.cookies['jwt']
        if(!refreshToken) throw new UnauthorizedException({message: 'no cookies were provided'});
        const user = await this.userModel.findOne({refreshToken});
        if(!user){throw new ForbiddenException({message: 'user was not found'})}
        
        try {

            const payload = this.jwtService.verify(
                refreshToken,
                {
                    secret: this.configService.get('JWT_REFRESH_SECRET'),
                },
            )
            console.log(payload);
            if (!payload?.sub || payload.sub !== user.sub) throw new ForbiddenException({message: 'mismatch user'})
            const accessToken = this.jwtService.sign(
                {sub: payload.sub}, 
                {
                    secret: this.configService.get('JWT_ACCESS_SECRET'),
                    expiresIn: +this.configService.get('JWT_ACCESS_EXPIRES'),
                }
            )
            return {accessToken}
        } catch (error) {
            console.log(error)
            throw new ForbiddenException({message: 'catch scope'})
        }
    }

    /**
     * The function `sberBusinessIdAuth` is an asynchronous function that handles the authentication
     * process for SberBusiness ID.
     * @param {string} code - The `code` parameter is a string that represents the authorization code
     * received from the SberBusinessId authentication flow. This code is used to obtain an access
     * token and other necessary tokens for further authentication and authorization.
     * @param {string} state - The `state` parameter is a unique identifier that is generated by the
     * server and passed to the client as part of the authorization process. It is used to prevent
     * cross-site request forgery (CSRF) attacks.
     * If user doesn't exist it creates new User document with corresponding 
     * parameters from SberBusiness API
     */
    async sberBusinessIdAuth(code:string, state: string){

        const isState = await this.sidModel.findOne({sid:state});
        if(!isState) {
            throw new ForbiddenException();
        }
        const sbTokenUrl = this.configService.get('SB_ID_TOKEN_URL')
        const sbAuthUserUrl = this.configService.get('SB_ID_AUTH_USER_INFO_URL')
        const sbAuthClientId = this.configService.get('SB_ID_AUTH_CLIENT_ID')
        const sbAuthRedirectUri = this.configService.get('SB_ID_AUTH_REDIRECT_URI')
        const sbClientSecret = this.configService.get('SB_ID_CLIENT_SECRET')
        const headers = {
            'Content-type': 'application/x-www-form-urlencoded',
            'Accept': 'application/jose',
            'Access-Control-Allow-Origin': '*'
        };
        const body = {
            'grant_type': 'authorization_code',
            'code': code,
            'client_id': sbAuthClientId,
            'redirect_uri': sbAuthRedirectUri,
            'client_secret': sbClientSecret, 
        }
        
        try {
            const response = await this.httpService.axiosRef.post(sbTokenUrl, body, {
                headers,
                httpsAgent: configuredHttpsAgent,
            })
    
            if (response.status !== 200) throw new UnauthorizedException();
            const {
                access_token, 
                token_type, 
                refresh_token,
                id_token,
            } = response.data

            const responseUser = await this.httpService.axiosRef.get(sbAuthUserUrl, {
                headers: {
                    'Authorization': `${token_type} ${access_token}`,
                },
                httpsAgent: configuredHttpsAgent,
            })

            if (responseUser.status !== 200) throw new UnauthorizedException();

            const openIdToken = responseUser?.data;
            if(!openIdToken) throw new BadRequestException();
            const [, payload] = openIdToken.split('.');
            const sbUser: SbUser = JSON.parse(Buffer.from(payload, 'base64').toString());
            const { sub } = sbUser;
            if(!sub) throw new BadRequestException;
            const user = await this.userModel.findOne({sub});
        
            if(!user){
                const newUser = new this.userModel({
                    refreshToken: refresh_token,
                    idToken: id_token,
                })
                for(const key in sbUser){
                    if(schemaHas(newUser, key)) newUser[key] = sbUser[key]
                }
                await newUser.save();
            } else {
                user.updateOne({refreshToken: refresh_token, idToken: id_token});
            }
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException()
        }
        
    }

    async getAuthRequestParams(){
        const nid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 36);
        const sid = new this.sidModel({nonce: nid(), sid:nid()});
        await sid.save();
        const scope = process.env.SB_ID_AUTH_SCOPE.split(' ').join('%20');
        const response_type = 'code';
        const state = sid.sid;
        const nonce = sid.nonce;
        const redirect_uri = process.env.SB_ID_AUTH_REDIRECT_URI.replaceAll(':', '%3A').replaceAll('/', '%3F');
        
        if(!scope || !state || !nonce || !redirect_uri) throw new BadRequestException();
         
        return `${process.env.SB_ID_AUTH_URL}?scope=${scope}&response_type=${response_type}&client_id=${process.env.SB_ID_AUTH_CLIENT_ID}&state=${state}&nonce=${nonce}&redirect_uri=${redirect_uri}`
    }
}
