import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GlobalService } from 'src/global/global.service';
import { companyResponse } from 'src/mocks/companyResponse';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class CompanyService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly globalService: GlobalService,

    ){}

    fakeGetCompany(){
        if(!companyResponse) throw new BadRequestException()
        return companyResponse;
    }

    async getCompany(user: {sub: string}){
        const foundUser = await this.userModel.findOne({sub: user.sub});
        if(!foundUser) throw new NotFoundException();
        const { sbbAccessToken } = foundUser;

        try {
            const response =  await this.globalService.reauthSbRequest(
                'get',
                this.globalService.getFintechUrl('clientInfo'),
                sbbAccessToken,
            )
            return response
        } catch (error) {
            throw error
        }
          
    }

}
