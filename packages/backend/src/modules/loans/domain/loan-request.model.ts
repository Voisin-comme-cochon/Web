import { LoanRequestStatus } from '../../../core/entities/loan-request.entity';

export interface LoanRequest {
    id: number;
    item_id: number;
    borrower_id: number;
    start_date: Date;
    end_date: Date;
    status: LoanRequestStatus;
    message?: string;
    created_at: Date;
}

export interface CreateLoanRequestRequest {
    item_id: number;
    start_date: Date;
    end_date: Date;
    message?: string;
}

export interface UpdateLoanRequestStatusRequest {
    id: number;
    status: LoanRequestStatus;
}
