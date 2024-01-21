import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { CreateUserDto } from './dto/createUserDto';


@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>){}

    async getAll(){
        const allUsers = this.userModel.find();
        return allUsers
    }

    async create(body: CreateUserDto){
        const {login} = body;
        const isExist = await this.userModel.findOne({login});
        if(isExist) throw new ForbiddenException()
        const newUser = new this.userModel(body)
        await newUser.save()
        return
    }
}
