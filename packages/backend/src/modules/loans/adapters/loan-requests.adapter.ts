import { LoanRequestEntity } from '../../../core/entities/loan-request.entity';
import { LoanRequest } from '../domain/loan-request.model';

export class LoanRequestsAdapter {
    public static entityToDomain(loanRequest: LoanRequestEntity): LoanRequest {
        return {
            id: loanRequest.id,
            item_id: loanRequest.item_id,
            borrower_id: loanRequest.borrower_id,
            start_date: loanRequest.start_date,
            end_date: loanRequest.end_date,
            status: loanRequest.status,
            message: loanRequest.message,
            created_at: loanRequest.created_at,
        };
    }

    public static listEntityToDomain(loanRequests: LoanRequestEntity[]): LoanRequest[] {
        return loanRequests.map((request) => this.entityToDomain(request));
    }
}
