import { Controller, Post, UseInterceptors, UploadedFile, Delete, Param, UseGuards, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Multer } from 'multer';
import { ObjectStorageService } from '../services/objectStorage.service';
import { IsLoginGuard } from '../../../middleware/is-login.middleware';
import { CochonError } from '../../../utils/CochonError';
import { BucketType } from '../domain/bucket-type.enum';

@ApiTags('Object Storage')
@Controller('object-storage')
export class ObjectStorageController {
    constructor(private readonly objectStorageService: ObjectStorageService) {}

    @Post('upload-to-bucket')
    @UseGuards(IsLoginGuard)
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload a file to a specific bucket' })
    @ApiConsumes('multipart/form-data')
    @ApiQuery({
        name: 'bucketType',
        enum: BucketType,
        description: 'Type of bucket to upload to',
        required: true,
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    async uploadToBucket(
        @UploadedFile() file: Express.Multer.File,
        @Query('bucketType') bucketType: BucketType
    ): Promise<{ url: string }> {
        if (!Object.values(BucketType).includes(bucketType)) {
            throw new CochonError('invalid-bucket-type', 'Type de bucket non valide', 400);
        }

        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_FILE_SIZE) {
            throw new CochonError('file-too-large', 'Fichier trop volumineux', 400);
        }

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new CochonError('invalid-file-type', 'Type de fichier non autorisé', 400);
        }

        const url = await this.objectStorageService.uploadFile(file.buffer, file.originalname, bucketType);
        return { url };
    }

    @Delete('delete-from-bucket/:fileName')
    @UseGuards(IsLoginGuard)
    @ApiOperation({ summary: 'Delete a file from a specific bucket' })
    @ApiParam({
        name: 'fileName',
        description: 'Name of the file to delete',
        required: true,
    })
    async deleteFromBucket(
        @Param('fileName') fileName: string,
        @Query('bucketType') bucketType: BucketType
    ): Promise<{ message: string }> {
        if (!Object.values(BucketType).includes(bucketType)) {
            throw new CochonError('invalid-bucket-type', 'Type de bucket non valide', 400);
        }

        await this.objectStorageService.deleteFile(fileName, bucketType);
        return { message: 'File deleted successfully' };
    }
}
