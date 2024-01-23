import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forRoot('mongodb://root:example@localhost:27018/'),
    UserModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
