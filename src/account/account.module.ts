import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { GlobalService } from 'src/global/global.service';
import { HttpModule } from '@nestjs/axios';
import { GlobalModule } from 'src/global/global.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: User.name, schema: UserSchema}
    ]),
    HttpModule,
    GlobalModule,
    ConfigModule,
    JwtModule, 
  ],
  controllers: [AccountController],
  providers: [AccountService, GlobalService],
})
export class AccountModule {}
