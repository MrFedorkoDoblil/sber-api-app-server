import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SbUser } from 'src/auth/types/sbUser';
import { GlobalService } from 'src/global/global.service';
import { companyResponse } from 'src/mocks/companyResponse';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class CompanyService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly configService: ConfigService,
        private readonly globalService: GlobalService,

    ){}

    fakeGetCompany(){
        if(!companyResponse) throw new BadRequestException()
        return companyResponse;
    }

    async getCompany(user: SbUser){
        const foundUser = await this.userModel.findOne({sub: user.sub});

        if(!foundUser) throw new NotFoundException();
        const { sbbAccessToken } = foundUser;

        try {
            return await this.globalService.reauthSbRequest(
                'get',
                this.globalService.composeUrl('fintech/api/v1/client-info'),
                sbbAccessToken,
            )

        } catch (error) {
            throw new InternalServerErrorException({
                message: 'Could not get client info',
                statusCode: 500,
            });
        }
          
    }

}
