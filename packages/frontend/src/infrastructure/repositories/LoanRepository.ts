import ApiService from '@/infrastructure/api/ApiService';
import { LoanModel, CreateLoanRequest, ReturnLoanRequest, LoanStatus } from '@/domain/models/loan.model';

export class LoanRepository {
    async getMyLoans(): Promise<LoanModel[]> {
        const response = await ApiService.get('/loans/my-loans');
        return response.data.map(this.mapLoan);
    }

    async getLentItems(): Promise<LoanModel[]> {
        const response = await ApiService.get('/loans/lent-items');
        return response.data.map(this.mapLoan);
    }

    async getOverdueLoans(): Promise<LoanModel[]> {
        const response = await ApiService.get('/loans/overdue');
        return response.data.map(this.mapLoan);
    }

    async getLoanById(id: number): Promise<LoanModel> {
        const response = await ApiService.get(`/loans/${id}`);
        return this.mapLoan(response.data);
    }

    async returnLoan(id: number, returnDate?: Date): Promise<void> {
        const data: any = {};
        if (returnDate) {
            data.actual_return_date = returnDate.toISOString();
        }
        await ApiService.put(`/loans/${id}/return`, data);
    }

    private mapLoan(data: any): LoanModel {
        return {
            id: data.id,
            loan_request_id: data.loan_request_id,
            item_id: data.item_id,
            borrower_id: data.borrower_id,
            start_date: new Date(data.start_date),
            end_date: new Date(data.end_date),
            actual_return_date: data.actual_return_date ? new Date(data.actual_return_date) : undefined,
            status: data.status as LoanStatus,
            created_at: new Date(data.created_at),
            item: data.item
                ? {
                      id: data.item.id,
                      name: data.item.name,
                      description: data.item.description,
                      image_url: data.item.image_url,
                      owner_id: data.item.owner_id,
                      category: data.item.category,
                  }
                : undefined,
            borrower: data.borrower
                ? {
                      id: data.borrower.id,
                      firstName: data.borrower.firstName,
                      lastName: data.borrower.lastName,
                      profileImageUrl: data.borrower.profileImageUrl,
                  }
                : undefined,
            owner: data.owner
                ? {
                      id: data.owner.id,
                      firstName: data.owner.firstName,
                      lastName: data.owner.lastName,
                      profileImageUrl: data.owner.profileImageUrl,
                  }
                : undefined,
        };
    }
}
