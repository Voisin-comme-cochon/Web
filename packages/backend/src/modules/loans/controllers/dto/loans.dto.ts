import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { LoanStatus } from '../../../../core/entities/loan.entity';

export class ReturnLoanDto {
    @ApiProperty({
        example: '2024-01-25',
        description: 'Actual return date (optional, defaults to current date)',
        required: false,
    })
    @IsDateString()
    @IsOptional()
    actual_return_date?: string;
}

export class GetLoanByIdDto {
    @ApiProperty({ example: 1, description: 'Loan ID' })
    @IsInt()
    @Type(() => Number)
    id!: number;
}

export class ResponseLoanDto {
    @ApiProperty({ example: 1, description: 'Loan ID' })
    id!: number;

    @ApiProperty({ example: 1, description: 'Loan Request ID' })
    loan_request_id!: number;

    @ApiProperty({ example: 1, description: 'Item ID' })
    item_id!: number;

    @ApiProperty({ example: 2, description: 'Borrower ID' })
    borrower_id!: number;

    @ApiProperty({ example: '2024-01-15', description: 'Start date' })
    start_date!: Date;

    @ApiProperty({ example: '2024-01-30', description: 'End date' })
    end_date!: Date;

    @ApiProperty({ example: '2024-01-25', description: 'Actual return date' })
    actual_return_date?: Date;

    @ApiProperty({ example: 'active', description: 'Status', enum: LoanStatus })
    status!: LoanStatus;

    @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Creation date' })
    created_at!: Date;
}
