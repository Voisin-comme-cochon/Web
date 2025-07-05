import { ItemAvailabilitySlotEntity } from '../../../core/entities/item-availability-slot.entity';
import {
    ItemAvailabilitySlot,
    CreateItemAvailabilitySlotRequest,
    UpdateItemAvailabilitySlotRequest,
    ItemAvailabilitySlotFilters,
} from './item-availability-slot.model';

export abstract class ItemAvailabilitySlotsRepository {
    abstract getSlotById(id: number): Promise<ItemAvailabilitySlot | null>;
    abstract getSlotsByAvailabilityId(availabilityId: number): Promise<ItemAvailabilitySlot[]>;
    abstract getSlotsByLoanRequestId(loanRequestId: number): Promise<ItemAvailabilitySlot[]>;
    abstract getSlotsByFilters(filters: ItemAvailabilitySlotFilters): Promise<ItemAvailabilitySlot[]>;
    abstract createSlot(slot: CreateItemAvailabilitySlotRequest): Promise<ItemAvailabilitySlotEntity>;
    abstract updateSlot(id: number, slot: UpdateItemAvailabilitySlotRequest): Promise<void>;
    abstract deleteSlot(id: number): Promise<void>;
    abstract checkSlotOverlap(
        availabilityId: number,
        startDate: Date,
        endDate: Date,
        excludeSlotId?: number
    ): Promise<boolean>;
    abstract getOverlappingSlots(
        availabilityId: number,
        startDate: Date,
        endDate: Date,
        excludeSlotId?: number
    ): Promise<ItemAvailabilitySlot[]>;
}