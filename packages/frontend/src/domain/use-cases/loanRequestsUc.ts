import { LoanRequestRepository } from '@/infrastructure/repositories/LoanRequestRepository';
import { 
    LoanRequestModel, 
    CreateLoanRequestRequest, 
    UpdateLoanRequestStatusRequest,
    LoanRequestStatus
} from '@/domain/models/loan-request.model';

export class LoanRequestsUc {
    private loanRequestRepository: LoanRequestRepository;

    constructor(loanRequestRepository: LoanRequestRepository) {
        this.loanRequestRepository = loanRequestRepository;
    }

    async createLoanRequest(request: CreateLoanRequestRequest): Promise<LoanRequestModel> {
        this.validateLoanRequestDates(request.start_date, request.end_date);
        return await this.loanRequestRepository.createLoanRequest(request);
    }

    async getMyLoanRequests(): Promise<LoanRequestModel[]> {
        return await this.loanRequestRepository.getMyLoanRequests();
    }

    async getReceivedLoanRequests(): Promise<LoanRequestModel[]> {
        return await this.loanRequestRepository.getReceivedLoanRequests();
    }

    async getLoanRequestById(id: number): Promise<LoanRequestModel> {
        return await this.loanRequestRepository.getLoanRequestById(id);
    }

    async acceptLoanRequest(id: number, currentUserId: number): Promise<void> {
        const loanRequest = await this.loanRequestRepository.getLoanRequestById(id);
        
        if (!loanRequest.item || loanRequest.item.owner_id !== currentUserId) {
            throw new Error('Vous ne pouvez accepter que les demandes pour vos propres objets');
        }
        
        if (loanRequest.status !== LoanRequestStatus.PENDING) {
            throw new Error('Seules les demandes en attente peuvent être acceptées');
        }

        return await this.loanRequestRepository.acceptLoanRequest(id);
    }

    async rejectLoanRequest(id: number, currentUserId: number): Promise<void> {
        const loanRequest = await this.loanRequestRepository.getLoanRequestById(id);
        
        if (!loanRequest.item || loanRequest.item.owner_id !== currentUserId) {
            throw new Error('Vous ne pouvez rejeter que les demandes pour vos propres objets');
        }
        
        if (loanRequest.status !== LoanRequestStatus.PENDING) {
            throw new Error('Seules les demandes en attente peuvent être rejetées');
        }

        return await this.loanRequestRepository.rejectLoanRequest(id);
    }

    async cancelLoanRequest(id: number, currentUserId: number): Promise<void> {
        const loanRequest = await this.loanRequestRepository.getLoanRequestById(id);
        
        if (loanRequest.borrower_id !== currentUserId) {
            throw new Error('Vous ne pouvez annuler que vos propres demandes');
        }
        
        if (loanRequest.status !== LoanRequestStatus.PENDING) {
            throw new Error('Seules les demandes en attente peuvent être annulées');
        }

        return await this.loanRequestRepository.cancelLoanRequest(id);
    }

    private validateLoanRequestDates(startDate: Date, endDate: Date): void {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Reset time to beginning of day for comparison
        
        if (startDate < now) {
            throw new Error('La date de début ne peut pas être dans le passé');
        }
        
        if (endDate <= startDate) {
            throw new Error('La date de fin doit être postérieure à la date de début');
        }
        
        const maxDuration = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        if (endDate.getTime() - startDate.getTime() > maxDuration) {
            throw new Error('La durée d\'emprunt ne peut pas dépasser 30 jours');
        }
    }

    canManageLoanRequest(loanRequest: LoanRequestModel, currentUserId: number): { canManage: boolean; isOwner: boolean; isBorrower: boolean } {
        const isOwner = loanRequest.item?.owner_id === currentUserId;
        const isBorrower = loanRequest.borrower_id === currentUserId;
        const canManage = isOwner || isBorrower;
        
        return { canManage, isOwner, isBorrower };
    }

    getLoanRequestStatusLabel(status: LoanRequestStatus): string {
        switch (status) {
            case LoanRequestStatus.PENDING:
                return 'En attente';
            case LoanRequestStatus.ACCEPTED:
                return 'Acceptée';
            case LoanRequestStatus.REJECTED:
                return 'Rejetée';
            case LoanRequestStatus.CANCELLED:
                return 'Annulée';
            default:
                return 'Statut inconnu';
        }
    }

    getLoanRequestStatusColor(status: LoanRequestStatus): string {
        switch (status) {
            case LoanRequestStatus.PENDING:
                return 'bg-yellow-100 text-yellow-800';
            case LoanRequestStatus.ACCEPTED:
                return 'bg-green-100 text-green-800';
            case LoanRequestStatus.REJECTED:
                return 'bg-red-100 text-red-800';
            case LoanRequestStatus.CANCELLED:
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }
}