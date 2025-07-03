import { DataSource } from 'typeorm';
import { LoanRequestEntity } from '../../../core/entities/loan-request.entity';
import { LoanRequestsRepository } from '../domain/loan-requests.abstract.repository';
import { LoanRequest, CreateLoanRequestRequest, UpdateLoanRequestStatusRequest } from '../domain/loan-request.model';
import { LoanRequestsAdapter } from '../adapters/loan-requests.adapter';

export class LoanRequestsRepositoryImplementation implements LoanRequestsRepository {
    constructor(private readonly dataSource: DataSource) {}

    async getLoanRequestById(id: number): Promise<LoanRequest | null> {
        const loanRequest = await this.dataSource.getRepository(LoanRequestEntity).findOne({
            where: { id },
            relations: ['item', 'borrower'],
        });

        if (!loanRequest) {
            return null;
        }

        return LoanRequestsAdapter.entityToDomain(loanRequest);
    }

    async getLoanRequestsByBorrower(borrowerId: number): Promise<LoanRequest[]> {
        const loanRequests = await this.dataSource.getRepository(LoanRequestEntity).find({
            where: { borrower_id: borrowerId },
            relations: ['item', 'borrower'],
            order: { created_at: 'DESC' },
        });

        return loanRequests.map((request) => LoanRequestsAdapter.entityToDomain(request));
    }

    async getLoanRequestsByOwner(ownerId: number): Promise<LoanRequest[]> {
        const loanRequests = await this.dataSource
            .getRepository(LoanRequestEntity)
            .createQueryBuilder('request')
            .leftJoinAndSelect('request.item', 'item')
            .leftJoinAndSelect('request.borrower', 'borrower')
            .where('item.owner_id = :ownerId', { ownerId })
            .orderBy('request.created_at', 'DESC')
            .getMany();

        return loanRequests.map((request) => LoanRequestsAdapter.entityToDomain(request));
    }

    async createLoanRequest(request: CreateLoanRequestRequest, borrowerId: number): Promise<LoanRequestEntity> {
        const loanRequestEntity = this.dataSource.getRepository(LoanRequestEntity).create({
            ...request,
            borrower_id: borrowerId,
        });

        return this.dataSource.getRepository(LoanRequestEntity).save(loanRequestEntity);
    }

    async updateLoanRequestStatus(id: number, status: UpdateLoanRequestStatusRequest['status']): Promise<void> {
        await this.dataSource.getRepository(LoanRequestEntity).update(id, { status });
    }
}
