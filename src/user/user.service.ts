import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import { Model } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ){}
  

  async create(createUserDto: CreateUserDto) {
    try {
      const newUser = await this.userModel.create({...createUserDto});
      await newUser.save();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException()
    }

  }
  /**
   * The function `insertTokensAndSub` takes an `updateUserDto` object, finds a user with the specified
   * login, and then iterates over the properties of the `updateUserDto` object.
   * @param {UpdateUserDto} updateUserDto - An object containing the updated user data.
   */
  async insertTokensAndSub(updateUserDto: UpdateUserDto) {
    const { login,sbbAccessToken,sbbRefreshToken,scope,sub  } = updateUserDto
    const foundUser = await this.userModel.findOne({login});
    if (!foundUser) throw new NotFoundException({
      message: 'No user with this login'
    });
    if(sbbAccessToken) foundUser.sbbAccessToken = sbbAccessToken;
    if(sbbRefreshToken) foundUser.sbbRefreshToken = sbbRefreshToken;
    if(scope) foundUser.scope = scope;
    if(sub) foundUser.sub = sub;
    await foundUser.save();
    return {message: 'updated'} 
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
