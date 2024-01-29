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
      throw new InternalServerErrorException()
    }

  }

  /**
   * The function `insertTokensAndSub` takes an `updateUserDto` object, finds a user with the specified
   * login, and then iterates over the properties of the `updateUserDto` object.
   * @param {UpdateUserDto} updateUserDto - An object containing the updated user data.
   */
  async insertTokensAndSub(updateUserDto: UpdateUserDto) {
    const { login  } = updateUserDto
    const foundUser = await this.userModel.findOne({login});
    if (!foundUser) throw new NotFoundException();
    for(const key in updateUserDto){
      if(key === 'login') return
      foundUser[key] = updateUserDto[key]
    }
    await foundUser.save();
    return {message: 'udated'} 
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
