export enum LoanStatus {
    ACTIVE = 'active',
    RETURNED = 'returned',
    OVERDUE = 'overdue'
}

export interface LoanModel {
    id: number;
    loan_request_id: number;
    item_id: number;
    borrower_id: number;
    start_date: Date;
    end_date: Date;
    actual_return_date?: Date;
    status: LoanStatus;
    created_at: Date;
    item?: {
        id: number;
        name: string;
        description?: string;
        image_url?: string;
        owner_id: number;
        category?: string;
    };
    borrower?: {
        id: number;
        firstName: string;
        lastName: string;
        profileImageUrl?: string;
    };
    owner?: {
        id: number;
        firstName: string;
        lastName: string;
        profileImageUrl?: string;
    };
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