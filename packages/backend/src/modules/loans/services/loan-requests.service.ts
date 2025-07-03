import { LoanRequestsRepository } from '../domain/loan-requests.abstract.repository';
import { LoansRepository } from '../domain/loans.abstract.repository';
import { ItemsRepository } from '../domain/items.abstract.repository';
import { LoanRequest, CreateLoanRequestRequest } from '../domain/loan-request.model';
import { LoanRequestStatus } from '../../../core/entities/loan-request.entity';
import { CochonError } from '../../../utils/CochonError';
import { UsersRepository } from '../../users/domain/users.abstract.repository';
import { NeighborhoodUserRepository } from '../../neighborhoods/domain/neighborhood-user.abstract.repository';
import { isNull } from '../../../utils/tools';

export class LoanRequestsService {
    constructor(
        private readonly loanRequestsRepository: LoanRequestsRepository,
        private readonly loansRepository: LoansRepository,
        private readonly itemsRepository: ItemsRepository,
        private readonly usersRepository: UsersRepository,
        private readonly neighborhoodUserRepository: NeighborhoodUserRepository
    ) {}

    async getLoanRequestById(id: number, userId: number): Promise<LoanRequest> {
        const loanRequest = await this.loanRequestsRepository.getLoanRequestById(id);
        if (isNull(loanRequest)) {
            throw new CochonError('loan_request_not_found', 'Loan request not found', 404);
        }

        const item = await this.itemsRepository.getItemById(loanRequest.item_id);
        if (loanRequest.borrower_id !== userId && item?.owner_id !== userId) {
            throw new CochonError('forbidden_access', 'Accès refusé à cette demande de prêt', 403, {
                userId,
                loanRequestId: id,
            });
        }

        return loanRequest;
    }

    async getLoanRequestsByBorrower(borrowerId: number, requestingUserId: number): Promise<LoanRequest[]> {
        if (borrowerId !== requestingUserId) {
            throw new CochonError('forbidden_access', 'Vous ne pouvez voir que vos propres demandes', 403, {
                requestingUserId,
                borrowerId,
            });
        }
        return this.loanRequestsRepository.getLoanRequestsByBorrower(borrowerId);
    }

    async getLoanRequestsByOwner(ownerId: number, requestingUserId: number): Promise<LoanRequest[]> {
        if (ownerId !== requestingUserId) {
            throw new CochonError('forbidden_access', 'Vous ne pouvez voir que les demandes pour vos objets', 403, {
                requestingUserId,
                ownerId,
            });
        }
        return this.loanRequestsRepository.getLoanRequestsByOwner(ownerId);
    }

    async createLoanRequest(
        itemId: number,
        request: Omit<CreateLoanRequestRequest, 'item_id'>,
        borrowerId: number
    ): Promise<LoanRequest> {
        const item = await this.itemsRepository.getItemById(itemId);
        if (isNull(item)) {
            throw new CochonError('item_not_found', 'Item not found', 404);
        }

        if (item.owner_id === borrowerId) {
            throw new CochonError('cannot_borrow_own_item', 'You cannot borrow your own items', 400);
        }

        const borrower = await this.usersRepository.getUserById(borrowerId);
        if (isNull(borrower)) {
            throw new CochonError('borrower_not_found', 'Borrower not found', 404);
        }

        await this.validateUserInNeighborhood(borrowerId, item.neighborhood_id);

        const startDate = new Date(request.start_date);
        const endDate = new Date(request.end_date);

        if (startDate >= endDate) {
            throw new CochonError('invalid_dates', 'Start date must be before end date', 400);
        }

        if (startDate < new Date()) {
            throw new CochonError('past_date', 'Start date cannot be in the past', 400);
        }

        const isAvailable = await this.itemsRepository.checkItemAvailability(itemId, startDate, endDate);
        if (!isAvailable) {
            throw new CochonError('item_not_available', 'Item is not available for the requested dates', 400);
        }

        const createdRequest = await this.loanRequestsRepository.createLoanRequest(
            {
                item_id: itemId,
                start_date: startDate,
                end_date: endDate,
                message: request.message,
            },
            borrowerId
        );

        return {
            id: createdRequest.id,
            item_id: createdRequest.item_id,
            borrower_id: createdRequest.borrower_id,
            start_date: createdRequest.start_date,
            end_date: createdRequest.end_date,
            status: createdRequest.status,
            message: createdRequest.message,
            created_at: createdRequest.created_at,
        };
    }

    async acceptLoanRequest(id: number, ownerId: number): Promise<void> {
        const loanRequest = await this.loanRequestsRepository.getLoanRequestById(id);
        if (isNull(loanRequest)) {
            throw new CochonError('loan_request_not_found', 'Loan request not found', 404);
        }

        if (loanRequest.status !== LoanRequestStatus.PENDING) {
            throw new CochonError('request_not_pending', 'Loan request is no longer pending', 400);
        }

        const item = await this.itemsRepository.getItemById(loanRequest.item_id);
        if (isNull(item) || item.owner_id !== ownerId) {
            throw new CochonError('forbidden_accept', 'You can only accept requests for your own items', 403);
        }

        const isStillAvailable = await this.itemsRepository.checkItemAvailability(
            loanRequest.item_id,
            loanRequest.start_date,
            loanRequest.end_date
        );

        if (!isStillAvailable) {
            throw new CochonError(
                'item_no_longer_available',
                'Item is no longer available for the requested dates',
                400
            );
        }

        await this.loanRequestsRepository.updateLoanRequestStatus(id, LoanRequestStatus.ACCEPTED);

        await this.loansRepository.createLoan({
            loan_request_id: id,
            item_id: loanRequest.item_id,
            borrower_id: loanRequest.borrower_id,
            start_date: loanRequest.start_date,
            end_date: loanRequest.end_date,
        });
    }

    async rejectLoanRequest(id: number, ownerId: number): Promise<void> {
        const loanRequest = await this.loanRequestsRepository.getLoanRequestById(id);
        if (isNull(loanRequest)) {
            throw new CochonError('loan_request_not_found', 'Loan request not found', 404);
        }

        if (loanRequest.status !== LoanRequestStatus.PENDING) {
            throw new CochonError('request_not_pending', 'Loan request is no longer pending', 400);
        }

        const item = await this.itemsRepository.getItemById(loanRequest.item_id);
        if (isNull(item) || item.owner_id !== ownerId) {
            throw new CochonError('forbidden_reject', 'You can only reject requests for your own items', 403);
        }

        await this.loanRequestsRepository.updateLoanRequestStatus(id, LoanRequestStatus.REJECTED);
    }

    async cancelLoanRequest(id: number, borrowerId: number): Promise<void> {
        const loanRequest = await this.loanRequestsRepository.getLoanRequestById(id);
        if (isNull(loanRequest)) {
            throw new CochonError('loan_request_not_found', 'Loan request not found', 404);
        }

        if (loanRequest.borrower_id !== borrowerId) {
            throw new CochonError('forbidden_cancel', 'You can only cancel your own requests', 403);
        }

        if (loanRequest.status !== LoanRequestStatus.PENDING) {
            throw new CochonError('cannot_cancel_non_pending', 'You can only cancel pending requests', 400);
        }

        await this.loanRequestsRepository.updateLoanRequestStatus(id, LoanRequestStatus.CANCELLED);
    }

    private async validateUserInNeighborhood(userId: number, neighborhoodId: number): Promise<void> {
        const isValid = await this.neighborhoodUserRepository.isUserMemberOfNeighborhood(userId, neighborhoodId);

        if (isNull(isValid)) {
            throw new CochonError('not_member_of_neighborhood', 'Vous devez être membre du quartier', 403, {
                userId,
                neighborhoodId,
            });
        }
    }
}
