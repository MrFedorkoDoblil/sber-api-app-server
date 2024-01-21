import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUserDto';

@Controller('user')
export class UserController {
    
    constructor(private userService: UserService){}
    
    @Get()
    async getAll(){
        return this.userService.getAll()
    }

    @HttpCode(201)
    @Post()
    async create(@Body() body: CreateUserDto){
        return this.userService.create(body)
    }

}
