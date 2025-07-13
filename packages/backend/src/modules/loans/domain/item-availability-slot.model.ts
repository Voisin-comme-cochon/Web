import { ItemAvailabilitySlotStatus } from '../../../core/entities/item-availability-slot.entity';

export interface ItemAvailabilitySlot {
    id: number;
    availability_id: number;
    start_date: Date;
    end_date: Date;
    status: ItemAvailabilitySlotStatus;
    loan_request_id?: number;
    created_at: Date;
}

export interface CreateItemAvailabilitySlotRequest {
    availability_id: number;
    start_date: Date;
    end_date: Date;
    status?: ItemAvailabilitySlotStatus;
    loan_request_id?: number;
}

export interface UpdateItemAvailabilitySlotRequest {
    status?: ItemAvailabilitySlotStatus;
    loan_request_id?: number;
}

export interface ItemAvailabilitySlotFilters {
    availability_id?: number;
    status?: ItemAvailabilitySlotStatus;
    loan_request_id?: number;
    start_date?: Date;
    end_date?: Date;
}
