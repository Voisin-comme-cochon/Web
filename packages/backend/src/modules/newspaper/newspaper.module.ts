import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Newspaper, NewspaperSchema } from './domain/newspaper.model';
import { NewspaperService } from './services/newspaper.service';
import { NewspaperController } from './controllers/newspaper.controller';
import { AuthModule } from '../auth/auth.module';
import { ObjectStorageModule } from '../objectStorage/objectStorage.module';
import { UsersModule } from '../users/users.module';
import { NeighborhoodModule } from '../neighborhoods/neighborhood.module';
import { TagsModule } from '../tags/tags.module';
import { NewspaperRepositoryImplementation } from './repository/newspaper.repository.implementation';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Newspaper.name, schema: NewspaperSchema }]),
    AuthModule,
    ObjectStorageModule,
    UsersModule,
    NeighborhoodModule,
    TagsModule,
  ],
  

  controllers: [NewspaperController],
  providers: [
    {
      provide: NewspaperService,
      useClass: NewspaperService,
    },
    NewspaperRepositoryImplementation,
  ],
  exports: [NewspaperService],
})
export class NewspaperModule {} 