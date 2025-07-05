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
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            item: loanRequest.item ? {
                id: loanRequest.item.id,
                name: loanRequest.item.name,
                description: loanRequest.item.description,
                image_url: loanRequest.item.image_url,
                owner_id: loanRequest.item.owner_id,
                category: loanRequest.item.category
            } : undefined,
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            borrower: loanRequest.borrower ? {
                id: loanRequest.borrower.id,
                firstName: loanRequest.borrower.firstName,
                lastName: loanRequest.borrower.lastName,
                profileImageUrl: loanRequest.borrower.profileImageUrl
            } : undefined
        };
    }

    public static listEntityToDomain(loanRequests: LoanRequestEntity[]): LoanRequest[] {
        return loanRequests.map((request) => this.entityToDomain(request));
    }
}
