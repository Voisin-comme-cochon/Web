import { LoanRequestEntity } from '../../../core/entities/loan-request.entity';
import { LoanRequest, CreateLoanRequestRequest, UpdateLoanRequestStatusRequest } from './loan-request.model';

export abstract class LoanRequestsRepository {
    abstract getLoanRequestById(id: number): Promise<LoanRequest | null>;

    abstract getLoanRequestsByBorrower(borrowerId: number): Promise<LoanRequest[]>;

    abstract getLoanRequestsByOwner(ownerId: number): Promise<LoanRequest[]>;

    abstract createLoanRequest(request: CreateLoanRequestRequest, borrowerId: number): Promise<LoanRequestEntity>;

    abstract updateLoanRequestStatus(id: number, status: UpdateLoanRequestStatusRequest['status']): Promise<void>;
}
