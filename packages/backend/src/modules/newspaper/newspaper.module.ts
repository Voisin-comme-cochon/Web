import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Newspaper, NewspaperSchema } from './domain/newspaper.model';
import { NewspaperService } from './services/newspaper.service';
import { NewspaperController } from './controllers/newspaper.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Newspaper.name, schema: NewspaperSchema }]),
    AuthModule,
  ],
  
  
  controllers: [NewspaperController],
  providers: [
    {
      provide: NewspaperService,
      useClass: NewspaperService,
    },
  ],
  exports: [NewspaperService],
})
export class NewspaperModule {} 