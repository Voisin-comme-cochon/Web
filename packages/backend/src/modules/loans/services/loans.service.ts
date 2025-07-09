import { LoansRepository } from '../domain/loans.abstract.repository';
import { ItemsRepository } from '../domain/items.abstract.repository';
import { ItemAvailabilitySlotsRepository } from '../domain/item-availability-slots.abstract.repository';
import { Loan, CreateLoanRequest } from '../domain/loan.model';
import { LoanStatus } from '../../../core/entities/loan.entity';
import { ItemAvailabilitySlotStatus } from '../../../core/entities/item-availability-slot.entity';
import { CochonError } from '../../../utils/CochonError';
import { ObjectStorageService } from '../../objectStorage/services/objectStorage.service';
import { BucketType } from '../../objectStorage/domain/bucket-type.enum';
import { isNull } from '../../../utils/tools';

export class LoansService {
    constructor(
        private readonly loansRepository: LoansRepository,
        private readonly itemsRepository: ItemsRepository,
        private readonly itemAvailabilitySlotsRepository: ItemAvailabilitySlotsRepository,
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

    async createLoan(loanData: CreateLoanRequest): Promise<void> {
        await this.loansRepository.createLoan(loanData);

        const slots = await this.itemAvailabilitySlotsRepository.getSlotsByLoanRequestId(loanData.loan_request_id);
        for (const slot of slots) {
            if (slot.status === ItemAvailabilitySlotStatus.RESERVED) {
                await this.itemAvailabilitySlotsRepository.updateSlot(slot.id, {
                    status: ItemAvailabilitySlotStatus.OCCUPIED,
                });
            }
        }
    }

    async returnLoan(id: number, userId: number, returnDate?: Date): Promise<void> {
        const loan = await this.loansRepository.getLoanById(id);
        if (isNull(loan)) {
            throw new CochonError('loan_not_found', 'Loan not found', 404);
        }

        if (loan.status !== LoanStatus.ACTIVE && loan.status !== LoanStatus.PENDING_RETURN) {
            throw new CochonError('loan_not_active', 'Loan is not active or pending return', 400);
        }

        const item = await this.itemsRepository.getItemById(loan.item_id);
        if (isNull(item)) {
            throw new CochonError('item_not_found', 'Item not found', 404);
        }

        const canReturn = loan.borrower_id === userId || item.owner_id === userId;
        if (!canReturn) {
            throw new CochonError('forbidden_return', 'You can only return loans for items you borrowed or own', 403);
        }

        // Check if this is the first or second confirmation
        if (loan.status === LoanStatus.ACTIVE) {
            // First confirmation - set to PENDING_RETURN
            await this.loansRepository.updateLoanReturnConfirmation(id, userId, returnDate || new Date());
            await this.loansRepository.updateLoanStatus(id, LoanStatus.PENDING_RETURN);
        } else if (loan.status === LoanStatus.PENDING_RETURN) {
            // Second confirmation - check it's from the other party
            if (loan.return_confirmed_by === userId) {
                throw new CochonError('already_confirmed', 'You have already confirmed this return', 400);
            }
            
            // Both parties confirmed - finalize the return
            await this.loansRepository.updateLoanStatus(id, LoanStatus.RETURNED);
            await this.loansRepository.returnLoan(id, returnDate || new Date());
            
            // Free the occupied slots for this loan
            const slots = await this.itemAvailabilitySlotsRepository.getSlotsByLoanRequestId(loan.loan_request_id);
            for (const slot of slots) {
                if (slot.status === ItemAvailabilitySlotStatus.OCCUPIED) {
                    await this.itemAvailabilitySlotsRepository.deleteSlot(slot.id);
                }
            }
        }
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
                item: loan.item
                    ? {
                          ...loan.item,
                          image_url: loan.item.image_url
                              ? await this.objectStorageService.getFileLink(loan.item.image_url, BucketType.ITEM_IMAGES)
                              : undefined,
                      }
                    : undefined,
                borrower: loan.borrower
                    ? {
                          ...loan.borrower,
                          profileImageUrl: loan.borrower.profileImageUrl
                              ? await this.objectStorageService.getFileLink(
                                    loan.borrower.profileImageUrl,
                                    BucketType.PROFILE_IMAGES
                                )
                              : undefined,
                      }
                    : undefined,
                owner: loan.owner
                    ? {
                          ...loan.owner,
                          profileImageUrl: loan.owner.profileImageUrl
                              ? await this.objectStorageService.getFileLink(
                                    loan.owner.profileImageUrl,
                                    BucketType.PROFILE_IMAGES
                                )
                              : undefined,
                      }
                    : undefined,
            }))
        );
    }
}
