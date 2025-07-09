import { DataSource } from 'typeorm';
import { LoanEntity, LoanStatus } from '../../../core/entities/loan.entity';
import { LoansRepository } from '../domain/loans.abstract.repository';
import { Loan, CreateLoanRequest } from '../domain/loan.model';
import { LoansAdapter } from '../adapters/loans.adapter';

export class LoansRepositoryImplementation implements LoansRepository {
    constructor(private readonly dataSource: DataSource) {}

    async getLoanById(id: number): Promise<Loan | null> {
        const loan = await this.dataSource.getRepository(LoanEntity).findOne({
            where: { id },
            relations: ['loan_request', 'item', 'borrower'],
        });

        if (!loan) {
            return null;
        }

        return LoansAdapter.entityToDomain(loan);
    }

    async getLoansByBorrower(borrowerId: number): Promise<Loan[]> {
        const loans = await this.dataSource
            .getRepository(LoanEntity)
            .createQueryBuilder('loan')
            .leftJoinAndSelect('loan.loan_request', 'request')
            .leftJoinAndSelect('loan.item', 'item')
            .leftJoinAndSelect('loan.borrower', 'borrower')
            .leftJoinAndSelect('item.owner', 'owner')
            .where('loan.borrower_id = :borrowerId', { borrowerId })
            .orderBy('loan.created_at', 'DESC')
            .getMany();

        return loans.map((loan) => LoansAdapter.entityToDomain(loan));
    }

    async getLoansByOwner(ownerId: number): Promise<Loan[]> {
        const loans = await this.dataSource
            .getRepository(LoanEntity)
            .createQueryBuilder('loan')
            .leftJoinAndSelect('loan.loan_request', 'request')
            .leftJoinAndSelect('loan.item', 'item')
            .leftJoinAndSelect('loan.borrower', 'borrower')
            .leftJoinAndSelect('item.owner', 'owner')
            .where('item.owner_id = :ownerId', { ownerId })
            .orderBy('loan.created_at', 'DESC')
            .getMany();

        return loans.map((loan) => LoansAdapter.entityToDomain(loan));
    }

    async getActiveLoansByItem(itemId: number): Promise<Loan[]> {
        const loans = await this.dataSource.getRepository(LoanEntity).find({
            where: {
                item_id: itemId,
                status: LoanStatus.ACTIVE,
            },
            relations: ['loan_request', 'item', 'borrower'],
            order: { start_date: 'ASC' },
        });

        return loans.map((loan) => LoansAdapter.entityToDomain(loan));
    }

    async createLoan(loan: CreateLoanRequest): Promise<LoanEntity> {
        const loanEntity = this.dataSource.getRepository(LoanEntity).create(loan);
        return this.dataSource.getRepository(LoanEntity).save(loanEntity);
    }

    async returnLoan(id: number, returnDate?: Date): Promise<void> {
        const updateData: Partial<LoanEntity> = {
            status: LoanStatus.RETURNED,
            actual_return_date: returnDate ?? new Date(),
        };

        await this.dataSource.getRepository(LoanEntity).update(id, updateData);
    }

    async updateLoanStatus(id: number, status: 'active' | 'returned' | 'overdue' | 'pending_return'): Promise<void> {
        await this.dataSource.getRepository(LoanEntity).update(id, { status: status as LoanStatus });
    }

    async updateLoanReturnConfirmation(id: number, userId: number, confirmationDate: Date): Promise<void> {
        await this.dataSource.getRepository(LoanEntity).update(id, {
            return_confirmed_by: userId,
            return_confirmed_at: confirmationDate,
        });
    }

    async getOverdueLoans(): Promise<Loan[]> {
        const today = new Date();
        const loans = await this.dataSource
            .getRepository(LoanEntity)
            .createQueryBuilder('loan')
            .leftJoinAndSelect('loan.loan_request', 'request')
            .leftJoinAndSelect('loan.item', 'item')
            .leftJoinAndSelect('loan.borrower', 'borrower')
            .where('loan.status = :status', { status: LoanStatus.ACTIVE })
            .andWhere('loan.end_date < :today', { today })
            .orderBy('loan.end_date', 'ASC')
            .getMany();

        return loans.map((loan) => LoansAdapter.entityToDomain(loan));
    }
}
