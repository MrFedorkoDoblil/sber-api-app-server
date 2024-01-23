import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as dotenv from 'dotenv'
import {readFileSync} from 'fs'
import { Agent } from 'https'
dotenv.config()

const httpsOptions = {
  pfx: readFileSync('./certs/SberBusinessAPI08092023.pfx'),
  passphrase: 'testtest'
};

export const configuredHttpsAgent = new Agent(httpsOptions);

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
      httpsOptions
    })
  await app.listen(3001)
}
bootstrap()
