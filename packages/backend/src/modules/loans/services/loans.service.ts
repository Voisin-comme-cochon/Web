import { LoansRepository } from '../domain/loans.abstract.repository';
import { ItemsRepository } from '../domain/items.abstract.repository';
import { Loan } from '../domain/loan.model';
import { LoanStatus } from '../../../core/entities/loan.entity';
import { CochonError } from '../../../utils/CochonError';
import { ObjectStorageService } from '../../objectStorage/services/objectStorage.service';
import { BucketType } from '../../objectStorage/domain/bucket-type.enum';
import { isNull } from '../../../utils/tools';

export class LoansService {
    constructor(
        private readonly loansRepository: LoansRepository,
        private readonly itemsRepository: ItemsRepository,
        private readonly objectStorageService: ObjectStorageService
    ) {}

    async getLoanById(id: number, userId: number): Promise<Loan> {
        const loan = await this.loansRepository.getLoanById(id);
        if (isNull(loan)) {
            throw new CochonError('loan_not_found', 'Loan not found', 404);
        }

        const item = await this.itemsRepository.getItemById(loan.item_id);
        if (loan.borrower_id !== userId && item?.owner_id !== userId) {
            throw new CochonError('forbidden_access', 'Accès refusé à ce prêt', 403, {
                userId,
                loanId: id,
            });
        }

        return loan;
    }

    async getLoansByBorrower(borrowerId: number, requestingUserId: number): Promise<Loan[]> {
        if (borrowerId !== requestingUserId) {
            throw new CochonError('forbidden_access', 'Vous ne pouvez voir que vos propres prêts', 403, {
                requestingUserId,
                borrowerId,
            });
        }
        const loans = await this.loansRepository.getLoansByBorrower(borrowerId);
        return this.processImageUrls(loans);
    }

    async getLoansByOwner(ownerId: number, requestingUserId: number): Promise<Loan[]> {
        if (ownerId !== requestingUserId) {
            throw new CochonError('forbidden_access', 'Vous ne pouvez voir que les prêts pour vos objets', 403, {
                requestingUserId,
                ownerId,
            });
        }
        const loans = await this.loansRepository.getLoansByOwner(ownerId);
        return this.processImageUrls(loans);
    }

    async returnLoan(id: number, userId: number, returnDate?: Date): Promise<void> {
        const loan = await this.loansRepository.getLoanById(id);
        if (isNull(loan)) {
            throw new CochonError('loan_not_found', 'Loan not found', 404);
        }

        if (loan.status !== LoanStatus.ACTIVE) {
            throw new CochonError('loan_not_active', 'Loan is not active', 400);
        }

        const item = await this.itemsRepository.getItemById(loan.item_id);
        if (isNull(item)) {
            throw new CochonError('item_not_found', 'Item not found', 404);
        }

        const canReturn = loan.borrower_id === userId || item.owner_id === userId;
        if (!canReturn) {
            throw new CochonError('forbidden_return', 'You can only return loans for items you borrowed or own', 403);
        }

        await this.loansRepository.returnLoan(id, returnDate);
    }

    async getOverdueLoans(userId: number): Promise<Loan[]> {
        const overdueLoans = await this.loansRepository.getOverdueLoans();

        const userOverdueLoans = [];
        for (const loan of overdueLoans) {
            if (loan.status === LoanStatus.ACTIVE) {
                await this.loansRepository.updateLoanStatus(loan.id, 'overdue');
            }

            const item = await this.itemsRepository.getItemById(loan.item_id);
            if (loan.borrower_id === userId || item?.owner_id === userId) {
                userOverdueLoans.push(loan);
            }
        }

        return this.processImageUrls(userOverdueLoans);
    }

    private async processImageUrls(loans: Loan[]): Promise<Loan[]> {
        return Promise.all(
            loans.map(async (loan) => ({
                ...loan,
                item: loan.item ? {
                    ...loan.item,
                    image_url: loan.item.image_url
                        ? await this.objectStorageService.getFileLink(loan.item.image_url, BucketType.ITEM_IMAGES)
                        : undefined,
                } : undefined,
                borrower: loan.borrower ? {
                    ...loan.borrower,
                    profileImageUrl: loan.borrower.profileImageUrl
                        ? await this.objectStorageService.getFileLink(loan.borrower.profileImageUrl, BucketType.PROFILE_IMAGES)
                        : undefined,
                } : undefined,
                owner: loan.owner ? {
                    ...loan.owner,
                    profileImageUrl: loan.owner.profileImageUrl
                        ? await this.objectStorageService.getFileLink(loan.owner.profileImageUrl, BucketType.PROFILE_IMAGES)
                        : undefined,
                } : undefined,
            }))
        );
    }
}
