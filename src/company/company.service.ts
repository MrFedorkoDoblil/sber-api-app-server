import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

    async getCompany(user: {sub: string}){
        const foundUser = await this.userModel.findOne({sub: user.sub});
        console.log('user.sub', user.sub);
        if(!foundUser) throw new NotFoundException();
        const { sbbAccessToken } = foundUser;
        console.log(this.globalService.getFintechUrl('clientInfo'),);
        try {
            const res = await this.globalService.reauthSbRequest(
                'get',
                this.globalService.getFintechUrl('clientInfo'),
                sbbAccessToken,
            )

            console.log("RESPONSE FROM CONTROLLER_______________-");
            console.log("RESPONSE FROM CONTROLLER_______________-");
            console.log("RESPONSE FROM CONTROLLER_______________-");
            console.log("RESPONSE FROM CONTROLLER_______________-");
            console.log("RESPONSE FROM CONTROLLER_______________-");
            console.log("RESPONSE FROM CONTROLLER_______________-");
            console.log("RESPONSE FROM CONTROLLER", res);
            console.log("RESPONSE FROM CONTROLLER_______________-");
            console.log("RESPONSE FROM CONTROLLER_______________-");
            console.log("RESPONSE FROM CONTROLLER_______________-");
            console.log("RESPONSE FROM CONTROLLER_______________-");
            console.log("RESPONSE FROM CONTROLLER_______________-");
            console.log("RESPONSE FROM CONTROLLER_______________-");

            return res

        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException({
                message: 'Could not get client info',
                statusCode: 500,
            });
        }
          
    }

}
