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
        };
    }

    public static listEntityToDomain(loans: LoanEntity[]): Loan[] {
        return loans.map((loan) => this.entityToDomain(loan));
    }
}
