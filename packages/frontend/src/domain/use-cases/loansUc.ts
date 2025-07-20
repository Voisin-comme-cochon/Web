import { LoanRepository } from '@/infrastructure/repositories/LoanRepository';
import { LoanModel, CreateLoanRequest, ReturnLoanRequest, LoanStatus } from '@/domain/models/loan.model';

export class LoansUc {
    private loanRepository: LoanRepository;

    constructor(loanRepository: LoanRepository) {
        this.loanRepository = loanRepository;
    }

    async getMyLoans(): Promise<LoanModel[]> {
        return await this.loanRepository.getMyLoans();
    }

    async getLentItems(): Promise<LoanModel[]> {
        return await this.loanRepository.getLentItems();
    }

    async getOverdueLoans(): Promise<LoanModel[]> {
        return await this.loanRepository.getOverdueLoans();
    }

    async getLoanById(id: number): Promise<LoanModel> {
        return await this.loanRepository.getLoanById(id);
    }

    async returnLoan(id: number, currentUserId: number, returnDate?: Date): Promise<void> {
        const loan = await this.loanRepository.getLoanById(id);

        const canReturn = this.canReturnLoan(loan, currentUserId);
        if (!canReturn.canReturn) {
            throw new Error(canReturn.reason || 'Vous ne pouvez pas marquer ce prêt comme rendu');
        }

        if (loan.status !== LoanStatus.ACTIVE && loan.status !== LoanStatus.PENDING_RETURN) {
            throw new Error('Seuls les prêts actifs ou en attente de confirmation peuvent être marqués comme rendus');
        }

        return await this.loanRepository.returnLoan(id, returnDate);
    }

    canReturnLoan(loan: LoanModel, currentUserId: number): { canReturn: boolean; reason?: string } {
        const isBorrower = loan.borrower_id === currentUserId;
        const isOwner = loan.item?.owner_id === currentUserId;

        if (!isBorrower && !isOwner) {
            return { canReturn: false, reason: 'Vous ne pouvez marquer comme rendu que vos propres emprunts ou prêts' };
        }

        if (loan.status !== LoanStatus.ACTIVE && loan.status !== LoanStatus.PENDING_RETURN) {
            return { canReturn: false, reason: "Ce prêt n'est pas actif" };
        }

        // Special handling for PENDING_RETURN status
        if (loan.status === LoanStatus.PENDING_RETURN) {
            if (loan.return_confirmed_by === currentUserId) {
                return { canReturn: false, reason: 'Vous avez déjà confirmé ce retour' };
            }
        }

        return { canReturn: true };
    }

    canManageLoan(
        loan: LoanModel,
        currentUserId: number
    ): { canManage: boolean; isOwner: boolean; isBorrower: boolean } {
        const isOwner = loan.item?.owner_id === currentUserId;
        const isBorrower = loan.borrower_id === currentUserId;
        const canManage = isOwner || isBorrower;

        return { canManage, isOwner, isBorrower };
    }

    isLoanOverdue(loan: LoanModel): boolean {
        const now = new Date();
        return loan.status === LoanStatus.ACTIVE && loan.end_date < now;
    }

    getDaysUntilReturn(loan: LoanModel): number {
        const now = new Date();
        const diffTime = loan.end_date.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getDaysOverdue(loan: LoanModel): number {
        const now = new Date();
        const diffTime = now.getTime() - loan.end_date.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getLoanStatusLabel(status: LoanStatus): string {
        switch (status) {
            case LoanStatus.ACTIVE:
                return 'Actif';
            case LoanStatus.PENDING_RETURN:
                return 'En attente de confirmation';
            case LoanStatus.RETURNED:
                return 'Rendu';
            case LoanStatus.OVERDUE:
                return 'En retard';
            default:
                return 'Statut inconnu';
        }
    }

    getLoanStatusColor(status: LoanStatus): string {
        switch (status) {
            case LoanStatus.ACTIVE:
                return 'bg-blue-100 text-blue-800';
            case LoanStatus.PENDING_RETURN:
                return 'bg-yellow-100 text-yellow-800';
            case LoanStatus.RETURNED:
                return 'bg-green-100 text-green-800';
            case LoanStatus.OVERDUE:
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    formatLoanDuration(loan: LoanModel): string {
        const diffTime = loan.end_date.getTime() - loan.start_date.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (days === 1) {
            return '1 jour';
        } else if (days < 7) {
            return `${days} jours`;
        } else if (days < 30) {
            const weeks = Math.floor(days / 7);
            const remainingDays = days % 7;
            if (remainingDays === 0) {
                return `${weeks} semaine${weeks > 1 ? 's' : ''}`;
            } else {
                return `${weeks} semaine${weeks > 1 ? 's' : ''} et ${remainingDays} jour${remainingDays > 1 ? 's' : ''}`;
            }
        } else {
            const months = Math.floor(days / 30);
            const remainingDays = days % 30;
            if (remainingDays === 0) {
                return `${months} mois`;
            } else {
                return `${months} mois et ${remainingDays} jour${remainingDays > 1 ? 's' : ''}`;
            }
        }
    }
}
