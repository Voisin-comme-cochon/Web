import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { CochonError } from '../../../utils/CochonError';
import { BucketType } from '../domain/bucket-type.enum';

@Injectable()
export class ObjectStorageService implements OnModuleInit {
    private minioClient: Minio.Client;
    private buckets: Map<BucketType, string> = new Map<BucketType, string>();
    private readonly region: string;

    constructor() {
        this.minioClient = new Minio.Client({
            endPoint: process.env.VCC_MINIO_ENDPOINT ?? 'localhost',
            port: Number(process.env.VCC_MINIO_PORT ?? '9000'),
            useSSL: process.env.VCC_MINIO_USE_SSL === 'true',
            accessKey: process.env.VCC_MINIO_ACCESS_KEY ?? 'minioadmin',
            secretKey: process.env.VCC_MINIO_SECRET_KEY ?? 'minioadmin',
            pathStyle: true,
        });

        this.region = process.env.VCC_MINIO_REGION ?? 'us-east-1';
        this.configureBuckets();
    }

    async onModuleInit(): Promise<void> {
        try {
            await this.initBuckets();
        } catch (error) {
            console.error('Failed to initialize Minio buckets:', error);
        }
    }

    /**
     * Upload a file to Minio
     * @param file The file buffer
     * @param fileName The name of the file
     * @param bucketType The type of bucket to upload to
     * @returns The URL of the uploaded file
     */
    async uploadFile(file: Buffer, fileName: string, bucketType: BucketType): Promise<string> {
        try {
            const bucketName = this.getBucketName(bucketType);

            const uniqueFileName = `${Date.now()}-${fileName}`;

            await this.minioClient.putObject(bucketName, uniqueFileName, file, file.length, {
                'Content-Type': this.getContentType(fileName),
            });

            return uniqueFileName;
        } catch (error) {
            console.error('Error uploading file to Minio:', error);
            throw new CochonError('file_upload_failed', 'Failed to upload file', 500);
        }
    }

    async getFileLink(fileName: string, bucketType: BucketType): Promise<string> {
        try {
            const bucketName = this.getBucketName(bucketType);

            const fileExists = await this.minioClient.statObject(bucketName, fileName).catch(() => false);
            if (!fileExists) {
                throw new CochonError('file_not_found', 'File not found', 404);
            }

            return await this.minioClient.presignedGetObject(bucketName, fileName, 24 * 60 * 60);
        } catch (error) {
            if (error instanceof CochonError) {
                throw error;
            }
            throw new CochonError('file_link_failed', 'Failed to get file link', 500);
        }
    }

    /**
     * Delete a file from Minio
     * @param fileName The name of the file to delete
     * @param bucketType The type of bucket to delete from
     */
    async deleteFile(fileName: string, bucketType: BucketType): Promise<void> {
        try {
            const bucketName = this.getBucketName(bucketType);

            const fileExists = await this.minioClient.statObject(bucketName, fileName).catch(() => false);

            if (!fileExists) {
                throw new CochonError('file_not_found', 'File not found', 404);
            }

            await this.minioClient.removeObject(bucketName, fileName);
        } catch (error) {
            if (error instanceof CochonError) {
                throw error;
            }
            throw new CochonError('file_delete_failed', 'Failed to delete file', 500);
        }
    }

    private configureBuckets(): void {
        if (!this.buckets.has(BucketType.PROFILE_IMAGES)) {
            this.buckets.set(
                BucketType.PROFILE_IMAGES,
                process.env.VCC_MINIO_PROFILE_BUCKET ?? BucketType.PROFILE_IMAGES
            );
        }
        if (!this.buckets.has(BucketType.NEIGHBORHOOD_IMAGES)) {
            this.buckets.set(
                BucketType.NEIGHBORHOOD_IMAGES,
                process.env.VCC_MINIO_NEIGHBORHOOD_BUCKET ?? BucketType.NEIGHBORHOOD_IMAGES
            );
        }
        if (!this.buckets.has(BucketType.EVENT_IMAGES)) {
            this.buckets.set(BucketType.EVENT_IMAGES, process.env.VCC_MINIO_EVENT_BUCKET ?? BucketType.EVENT_IMAGES);
        }
    }

    private async initBuckets(): Promise<void> {
        for (const [, bucketName] of this.buckets) {
            await this.initBucket(bucketName);
        }
    }

    private async initBucket(bucketName: string): Promise<void> {
        const bucketExists = await this.minioClient.bucketExists(bucketName);
        if (!bucketExists) {
            await this.minioClient.makeBucket(bucketName, this.region);
            const policy = {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: { AWS: ['*'] },
                        Action: ['s3:GetObject'],
                        Resource: [`arn:aws:s3:::${bucketName}/*`],
                    },
                ],
            };
            await this.minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
        }
    }

    /**
     * Get the bucket name for a given bucket type
     * @param bucketType The type of bucket
     * @returns The name of the bucket
     */
    private getBucketName(bucketType: BucketType): string {
        const bucketName = this.buckets.get(bucketType);
        if (!bucketName) {
            throw new CochonError('bucket_not_found', `Bucket type ${bucketType} not configured`, 500);
        }
        return bucketName;
    }

    /**
     * Get the content type of a file based on its extension
     * @param fileName The name of the file
     * @returns The content type
     */
    private getContentType(fileName: string): string {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'png':
                return 'image/png';
            case 'gif':
                return 'image/gif';
            case 'webp':
                return 'image/webp';
            default:
                return 'application/octet-stream';
        }
    }
}
