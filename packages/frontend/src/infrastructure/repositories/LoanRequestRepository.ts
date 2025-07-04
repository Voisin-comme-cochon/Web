import ApiService from '@/infrastructure/api/ApiService';
import { 
    LoanRequestModel, 
    CreateLoanRequestRequest, 
    UpdateLoanRequestStatusRequest,
    LoanRequestStatus
} from '@/domain/models/loan-request.model';

export class LoanRequestRepository {
    async createLoanRequest(request: CreateLoanRequestRequest): Promise<LoanRequestModel> {
        const response = await ApiService.post(`/items/${request.item_id}/loan-requests`, {
            start_date: request.start_date.toISOString(),
            end_date: request.end_date.toISOString(),
            message: request.message
        });
        return this.mapLoanRequest(response.data);
    }

    async getMyLoanRequests(): Promise<LoanRequestModel[]> {
        const response = await ApiService.get('/loan-requests/my-requests');
        return response.data.map(this.mapLoanRequest);
    }

    async getReceivedLoanRequests(): Promise<LoanRequestModel[]> {
        const response = await ApiService.get('/loan-requests/received');
        return response.data.map(this.mapLoanRequest);
    }

    async getLoanRequestById(id: number): Promise<LoanRequestModel> {
        const response = await ApiService.get(`/loan-requests/${id}`);
        return this.mapLoanRequest(response.data);
    }

    async acceptLoanRequest(id: number): Promise<void> {
        await ApiService.put(`/loan-requests/${id}/accept`);
    }

    async rejectLoanRequest(id: number): Promise<void> {
        await ApiService.put(`/loan-requests/${id}/reject`);
    }

    async cancelLoanRequest(id: number): Promise<void> {
        await ApiService.put(`/loan-requests/${id}/cancel`);
    }

    private mapLoanRequest(data: any): LoanRequestModel {
        return {
            id: data.id,
            item_id: data.item_id,
            borrower_id: data.borrower_id,
            start_date: new Date(data.start_date),
            end_date: new Date(data.end_date),
            status: data.status as LoanRequestStatus,
            message: data.message,
            created_at: new Date(data.created_at),
            item: data.item ? {
                id: data.item.id,
                name: data.item.name,
                description: data.item.description,
                image_url: data.item.image_url,
                owner_id: data.item.owner_id,
                category: data.item.category
            } : undefined,
            borrower: data.borrower ? {
                id: data.borrower.id,
                firstName: data.borrower.firstName,
                lastName: data.borrower.lastName,
                profileImageUrl: data.borrower.profileImageUrl
            } : undefined
        };
    }
}