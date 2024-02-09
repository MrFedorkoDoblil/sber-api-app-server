import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { GlobalService } from 'src/global/global.service';
  
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly globalService: GlobalService
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const secret = this.configService.get('JWT_ACCESS_SECRET');
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) throw new UnauthorizedException('No access_token was provided in request header');
        try {
            const payload = await this.jwtService.verifyAsync(
            token,
            {
                secret
            }
            );
            const sbbAccessToken = await this.globalService.checkUserBySub(payload);
            request['user'] = {...payload, sbbAccessToken};
        } catch {
            throw new UnauthorizedException('Access_token validation failed');
        }
        return true;
    }
    
    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}