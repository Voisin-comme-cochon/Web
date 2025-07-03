import { LoanStatus } from '../../../core/entities/loan.entity';

export interface Loan {
    id: number;
    loan_request_id: number;
    item_id: number;
    borrower_id: number;
    start_date: Date;
    end_date: Date;
    actual_return_date?: Date;
    status: LoanStatus;
    created_at: Date;
}

export interface CreateLoanRequest {
    loan_request_id: number;
    item_id: number;
    borrower_id: number;
    start_date: Date;
    end_date: Date;
}

export interface ReturnLoanRequest {
    id: number;
    actual_return_date?: Date;
}
