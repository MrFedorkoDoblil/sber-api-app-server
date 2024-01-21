import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Sid, SidSchema } from 'src/schemas/sid.schema';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name: User.name, schema: UserSchema},
      {name: Sid.name, schema: SidSchema},
    ])
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
