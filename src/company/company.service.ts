import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SbUser } from 'src/auth/types/sbUser';
import { companyResponse } from 'src/mocks/companyResponse';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class CompanyService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly httpService: HttpService,
        private readonly jwtService: JwtService,

    ){}

    fakeGetCompany(){
        if(!companyResponse) throw new BadRequestException()
        return companyResponse;
    }

    async getCompany(user: SbUser){
        const foundUser = await this.userModel.findOne({sub: user.sub});
        if(!user) throw new NotFoundException();
        return foundUser;
    }

}
