import { LoanEntity } from '../../../core/entities/loan.entity';
import { Loan } from '../domain/loan.model';

export class LoansAdapter {
    public static entityToDomain(loan: LoanEntity): Loan {
        return {
            id: loan.id,
            loan_request_id: loan.loan_request_id,
            item_id: loan.item_id,
            borrower_id: loan.borrower_id,
            start_date: loan.start_date,
            end_date: loan.end_date,
            actual_return_date: loan.actual_return_date,
            status: loan.status,
            created_at: loan.created_at,
            item: loan.item ? {
                id: loan.item.id,
                name: loan.item.name,
                description: loan.item.description,
                image_url: loan.item.image_url,
                owner_id: loan.item.owner_id,
                category: loan.item.category
            } : undefined,
            borrower: loan.borrower ? {
                id: loan.borrower.id,
                firstName: loan.borrower.firstName,
                lastName: loan.borrower.lastName,
                profileImageUrl: loan.borrower.profileImageUrl
            } : undefined,
            owner: loan.item?.owner ? {
                id: loan.item.owner.id,
                firstName: loan.item.owner.firstName,
                lastName: loan.item.owner.lastName,
                profileImageUrl: loan.item.owner.profileImageUrl
            } : undefined,
        };
    }

    public static listEntityToDomain(loans: LoanEntity[]): Loan[] {
        return loans.map((loan) => this.entityToDomain(loan));
    }
}
