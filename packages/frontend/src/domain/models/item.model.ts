export enum ItemAvailabilityStatus {
    AVAILABLE = 'available',
    UNAVAILABLE = 'unavailable',
    PARTIALLY_BOOKED = 'partially_booked',
}

export enum ItemAvailabilitySlotStatus {
    AVAILABLE = 'available',
    RESERVED = 'reserved',
    OCCUPIED = 'occupied',
}

export interface ItemModel {
    id: number;
    name: string;
    description?: string;
    category?: string;
    image_url?: string;
    owner_id: number;
    neighborhood_id: number;
    created_at: Date;
    availabilities?: ItemAvailabilityModel[];
    owner?: {
        id: number;
        firstName: string;
        lastName: string;
        profileImageUrl?: string;
    };
}

export interface ItemAvailabilitySlotModel {
    id: number;
    availability_id: number;
    start_date: Date;
    end_date: Date;
    status: ItemAvailabilitySlotStatus;
    loan_request_id?: number;
    created_at: Date;
}

export interface ItemAvailabilityModel {
    id: number;
    item_id: number;
    start_date: Date;
    end_date: Date;
    status: ItemAvailabilityStatus;
    created_at: Date;
    slots?: ItemAvailabilitySlotModel[];
}

export interface CreateItemRequest {
    name: string;
    description?: string;
    category?: string;
    image?: File;
    neighborhood_id: number;
}

export interface UpdateItemRequest {
    name?: string;
    description?: string;
    category?: string;
    image?: File;
}

export interface CreateItemAvailabilityRequest {
    item_id: number;
    start_date: Date;
    end_date: Date;
}

export interface UpdateItemAvailabilityRequest {
    start_date?: Date;
    end_date?: Date;
    status?: ItemAvailabilityStatus;
}

export interface GetItemsFilters {
    neighborhoodId: number;
    category?: string;
    search?: string;
    status?: ItemAvailabilityStatus;
    page?: number;
    limit?: number;
}
