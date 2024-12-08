import { Module } from '@nestjs/common';

import { LinksModule } from './links/links.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [LinksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
