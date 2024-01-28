import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { HttpModule } from '@nestjs/axios';
import { GlobalModule } from 'src/global/global.module';
import { ConfigModule } from '@nestjs/config';
import { GlobalService } from 'src/global/global.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name: User.name, schema: UserSchema}
    ]),
    HttpModule,
    GlobalModule,
    ConfigModule,
    JwtModule, 
  ],
  controllers: [CompanyController],
  providers: [CompanyService,  GlobalService]
})
export class CompanyModule {}
