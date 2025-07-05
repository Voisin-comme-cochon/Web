import { ItemAvailabilityStatus } from '../../../core/entities/item-availability.entity';
import { ItemAvailabilitySlot } from './item-availability-slot.model';

export interface Item {
    id: number;
    name: string;
    description?: string;
    category?: string;
    image_url?: string;
    owner_id: number;
    neighborhood_id: number;
    created_at: Date;
    availabilities?: ItemAvailability[];
}

export interface ItemAvailability {
    id: number;
    item_id: number;
    start_date: Date;
    end_date: Date;
    status: ItemAvailabilityStatus;
    created_at: Date;
    slots?: ItemAvailabilitySlot[];
}

export interface CreateItemRequest {
    name: string;
    description?: string;
    category?: string;
    image_url?: string;
    neighborhood_id: number;
}

export interface CreateItemAvailabilityRequest {
    item_id: number;
    start_date: Date;
    end_date: Date;
}

export interface ItemFilters {
    search?: string;
    category?: string;
    status?: ItemAvailabilityStatus;
}
