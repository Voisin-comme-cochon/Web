import { LoanEntity } from '../../../core/entities/loan.entity';
import { Loan, CreateLoanRequest } from './loan.model';

export abstract class LoansRepository {
    abstract getLoanById(id: number): Promise<Loan | null>;

    abstract getLoansByBorrower(borrowerId: number): Promise<Loan[]>;

    abstract getLoansByOwner(ownerId: number): Promise<Loan[]>;

    abstract createLoan(loan: CreateLoanRequest): Promise<LoanEntity>;

    abstract returnLoan(id: number, returnDate?: Date): Promise<void>;

    abstract updateLoanStatus(id: number, status: 'active' | 'returned' | 'overdue' | 'pending_return'): Promise<void>;

    abstract updateLoanReturnConfirmation(id: number, userId: number, confirmationDate: Date): Promise<void>;

    abstract getOverdueLoans(): Promise<Loan[]>;
}
