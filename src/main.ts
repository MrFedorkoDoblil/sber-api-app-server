import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as dotenv from 'dotenv'
import {readFileSync} from 'fs'
import { Agent } from 'https'
import * as cookieParser from 'cookie-parser';
dotenv.config()


const httpsOptions = {
  // pfx: readFileSync('./certs/cert.pfx'),
  pfx: readFileSync('./certs/cert2.pfx'),
  passphrase: 'testtest',
  rejectUnauthorized: false,
};

export const configuredHttpsAgent = new Agent(httpsOptions);

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions
  })
  app.use(cookieParser());
  app.enableCors({origin: true});
  await app.listen(3001)
}
bootstrap()
