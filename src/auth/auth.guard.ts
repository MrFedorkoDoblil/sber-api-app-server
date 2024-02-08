import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
  
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const secret = this.configService.get('JWT_ACCESS_SECRET');
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        console.log('token', token);
        if (!token) throw new UnauthorizedException('No access_token was provided in request header');
        try {
            const payload = await this.jwtService.verifyAsync(
            token,
            {
                secret
            }
            );
            request['user'] = payload;
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