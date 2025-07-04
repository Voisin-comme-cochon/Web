export enum LoanRequestStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled'
}

export interface LoanRequestModel {
    id: number;
    item_id: number;
    borrower_id: number;
    start_date: Date;
    end_date: Date;
    status: LoanRequestStatus;
    message?: string;
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