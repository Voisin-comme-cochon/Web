import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { LoanRequestStatus } from '../../../../core/entities/loan-request.entity';

export class CreateLoanRequestDto {
    @ApiProperty({ example: '2024-01-15', description: 'Start date of the loan' })
    @IsDateString()
    start_date!: string;

    @ApiProperty({ example: '2024-01-30', description: 'End date of the loan' })
    @IsDateString()
    end_date!: string;

    @ApiProperty({
        example: 'I need this for my home renovation project',
        description: 'Message to the owner',
        required: false,
    })
    @IsString()
    @IsOptional()
    message?: string;
}

export class UpdateLoanRequestStatusDto {
    @ApiProperty({
        example: 'accepted',
        description: 'New status of the loan request',
        enum: LoanRequestStatus,
    })
    @IsEnum(LoanRequestStatus)
    status!: LoanRequestStatus;
}

export class GetLoanRequestByIdDto {
    @ApiProperty({ example: 1, description: 'Loan Request ID' })
    @IsInt()
    @Type(() => Number)
    id!: number;
}

export class ResponseLoanRequestDto {
    @ApiProperty({ example: 1, description: 'Loan Request ID' })
    id!: number;

    @ApiProperty({ example: 1, description: 'Item ID' })
    item_id!: number;

    @ApiProperty({ example: 2, description: 'Borrower ID' })
    borrower_id!: number;

    @ApiProperty({ example: '2024-01-15', description: 'Start date' })
    start_date!: Date;

    @ApiProperty({ example: '2024-01-30', description: 'End date' })
    end_date!: Date;

    @ApiProperty({ example: 'pending', description: 'Status', enum: LoanRequestStatus })
    status!: LoanRequestStatus;

    @ApiProperty({ example: 'I need this for my home renovation project', description: 'Message' })
    message?: string;

    @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Creation date' })
    created_at!: Date;
}
