import { Global, Module } from '@nestjs/common';
import { GlobalService } from './global.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports:[
    HttpModule,
    MongooseModule.forFeature([
      {name: User.name, schema: UserSchema}
    ])
  ],
  providers: [GlobalService],
  exports:[GlobalService],
})
export class GlobalModule {}
