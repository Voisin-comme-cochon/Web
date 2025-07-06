import { ApiResponse } from '@/domain/models/api.model';
import { 
    ItemAvailabilitySlotModel, 
    ItemAvailabilitySlotStatus, 
    CreateItemAvailabilitySlotRequest 
} from '@/domain/models/item.model';
import { apiClient } from '@/infrastructure/api/apiClient';

export interface SlotFilters {
    availability_id?: number;
    loan_request_id?: number;
    status?: ItemAvailabilitySlotStatus;
    start_date?: Date;
    end_date?: Date;
}

export class SlotsRepository {
    private readonly baseUrl = '/slots';

    async getSlotById(id: number): Promise<ItemAvailabilitySlotModel> {
        const response = await apiClient.get<ApiResponse<ItemAvailabilitySlotModel>>(`${this.baseUrl}/${id}`);
        return response.data.data;
    }

    async getSlotsByAvailabilityId(availabilityId: number): Promise<ItemAvailabilitySlotModel[]> {
        const response = await apiClient.get<ApiResponse<ItemAvailabilitySlotModel[]>>(
            `${this.baseUrl}/availability/${availabilityId}`
        );
        return response.data.data;
    }

    async getSlotsByLoanRequestId(loanRequestId: number): Promise<ItemAvailabilitySlotModel[]> {
        const response = await apiClient.get<ApiResponse<ItemAvailabilitySlotModel[]>>(
            `${this.baseUrl}/loan-request/${loanRequestId}`
        );
        return response.data.data;
    }

    async getSlotsWithFilters(filters: SlotFilters): Promise<ItemAvailabilitySlotModel[]> {
        const params = new URLSearchParams();
        
        if (filters.availability_id) {
            params.append('availability_id', filters.availability_id.toString());
        }
        
        if (filters.loan_request_id) {
            params.append('loan_request_id', filters.loan_request_id.toString());
        }
        
        if (filters.status) {
            params.append('status', filters.status);
        }
        
        if (filters.start_date) {
            params.append('start_date', filters.start_date.toISOString());
        }
        
        if (filters.end_date) {
            params.append('end_date', filters.end_date.toISOString());
        }

        const response = await apiClient.get<ApiResponse<ItemAvailabilitySlotModel[]>>(
            `${this.baseUrl}?${params.toString()}`
        );
        return response.data.data;
    }

    async createSlot(slotData: CreateItemAvailabilitySlotRequest): Promise<ItemAvailabilitySlotModel> {
        const response = await apiClient.post<ApiResponse<ItemAvailabilitySlotModel>>(
            this.baseUrl,
            slotData
        );
        return response.data.data;
    }

    async deleteSlot(id: number): Promise<boolean> {
        const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
            `${this.baseUrl}/${id}`
        );
        return response.data.data.success;
    }

    async cancelSlot(id: number): Promise<boolean> {
        const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
            `${this.baseUrl}/${id}/cancel`
        );
        return response.data.data.success;
    }

    async checkSlotConflicts(
        availabilityId: number,
        startDate: Date,
        endDate: Date,
        excludeSlotId?: number
    ): Promise<ItemAvailabilitySlotModel[]> {
        const params = new URLSearchParams();
        params.append('startDate', startDate.toISOString());
        params.append('endDate', endDate.toISOString());
        
        if (excludeSlotId) {
            params.append('excludeSlotId', excludeSlotId.toString());
        }

        const response = await apiClient.get<ApiResponse<ItemAvailabilitySlotModel[]>>(
            `${this.baseUrl}/availability/${availabilityId}/conflicts?${params.toString()}`
        );
        return response.data.data;
    }

    async getAvailableSlots(
        availabilityId: number,
        startDate?: Date,
        endDate?: Date
    ): Promise<ItemAvailabilitySlotModel[]> {
        const params = new URLSearchParams();
        
        if (startDate) {
            params.append('startDate', startDate.toISOString());
        }
        
        if (endDate) {
            params.append('endDate', endDate.toISOString());
        }

        const response = await apiClient.get<ApiResponse<ItemAvailabilitySlotModel[]>>(
            `${this.baseUrl}/availability/${availabilityId}/available?${params.toString()}`
        );
        return response.data.data;
    }
}