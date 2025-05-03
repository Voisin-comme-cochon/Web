import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ObjectStorageService } from './services/objectStorage.service';
import { ObjectStorageController } from './controllers/objectStorage.controller';

@Module({
    imports: [forwardRef(() => AuthModule)],
    controllers: [ObjectStorageController],
    providers: [ObjectStorageService],
    exports: [ObjectStorageService],
})
export class ObjectStorageModule {}
