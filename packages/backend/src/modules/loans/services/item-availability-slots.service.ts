import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { 
    ItemAvailabilitySlot, 
    CreateItemAvailabilitySlotRequest, 
    ItemAvailabilitySlotFilters 
} from '../domain/item-availability-slot.model';
import { ItemAvailabilitySlotStatus } from '../../../core/entities/item-availability-slot.entity';
import { ItemAvailabilitySlotsRepository } from '../domain/item-availability-slots.abstract.repository';
import { ItemsRepository } from '../domain/items.abstract.repository';

@Injectable()
export class ItemAvailabilitySlotsService {
    constructor(
        private readonly slotsRepository: ItemAvailabilitySlotsRepository,
        private readonly itemsRepository: ItemsRepository
    ) {}

    async getSlotById(id: number, userId: number): Promise<ItemAvailabilitySlot | null> {
        const slot = await this.slotsRepository.getSlotById(id);
        
        if (!slot) {
            return null;
        }

        // Check if user has permission to view this slot
        await this.checkSlotPermission(slot, userId);
        
        return slot;
    }

    async getSlotsByAvailabilityId(availabilityId: number, userId: number): Promise<ItemAvailabilitySlot[]> {
        // Check if user has permission to view this availability
        await this.checkAvailabilityPermission(availabilityId, userId);
        
        return this.slotsRepository.getSlotsByAvailabilityId(availabilityId);
    }

    async getSlotsByLoanRequestId(loanRequestId: number, userId: number): Promise<ItemAvailabilitySlot[]> {
        // Check if user has permission to view this loan request
        await this.checkLoanRequestPermission(loanRequestId, userId);
        
        return this.slotsRepository.getSlotsByLoanRequestId(loanRequestId);
    }

    async getSlotsWithFilters(filters: ItemAvailabilitySlotFilters, userId: number): Promise<ItemAvailabilitySlot[]> {
        // If availability_id is provided, check permission
        if (filters.availability_id) {
            await this.checkAvailabilityPermission(filters.availability_id, userId);
        }
        
        // If loan_request_id is provided, check permission
        if (filters.loan_request_id) {
            await this.checkLoanRequestPermission(filters.loan_request_id, userId);
        }
        
        return this.slotsRepository.getSlotsByFilters(filters);
    }

    async createSlot(createSlotRequest: CreateItemAvailabilitySlotRequest, userId: number): Promise<ItemAvailabilitySlot> {
        // Check if user has permission to create slot for this availability
        await this.checkAvailabilityPermission(createSlotRequest.availability_id, userId);
        
        // Check for conflicts
        const conflicts = await this.slotsRepository.getOverlappingSlots(
            createSlotRequest.availability_id,
            createSlotRequest.start_date,
            createSlotRequest.end_date
        );
        
        if (conflicts.length > 0) {
            throw new ForbiddenException('Slot conflicts with existing reservations');
        }

        const slotEntity = await this.slotsRepository.createSlot(createSlotRequest);
        const createdSlot = await this.slotsRepository.getSlotById(slotEntity.id);
        if (!createdSlot) {
            throw new NotFoundException('Failed to create slot');
        }
        return createdSlot;
    }

    async deleteSlot(id: number, userId: number): Promise<boolean> {
        const slot = await this.slotsRepository.getSlotById(id);
        
        if (!slot) {
            throw new NotFoundException('Slot not found');
        }

        // Check if user has permission to delete this slot
        await this.checkSlotPermission(slot, userId);
        
        // Only allow deletion of AVAILABLE or RESERVED slots
        if (slot.status === ItemAvailabilitySlotStatus.OCCUPIED) {
            throw new ForbiddenException('Cannot delete occupied slot');
        }

        await this.slotsRepository.deleteSlot(id);
        return true;
    }

    async cancelSlot(id: number, userId: number): Promise<boolean> {
        const slot = await this.slotsRepository.getSlotById(id);
        
        if (!slot) {
            throw new NotFoundException('Slot not found');
        }

        // Check if user has permission to cancel this slot
        await this.checkSlotPermission(slot, userId);
        
        // Only allow cancellation of RESERVED slots
        if (slot.status !== ItemAvailabilitySlotStatus.RESERVED) {
            throw new ForbiddenException('Only reserved slots can be cancelled');
        }

        await this.slotsRepository.deleteSlot(id);
        return true;
    }

    async checkSlotConflicts(
        availabilityId: number,
        startDate: Date,
        endDate: Date,
        excludeSlotId?: number,
        userId?: number
    ): Promise<ItemAvailabilitySlot[]> {
        // Check if user has permission to check conflicts for this availability
        if (userId) {
            await this.checkAvailabilityPermission(availabilityId, userId);
        }
        
        return this.slotsRepository.getOverlappingSlots(
            availabilityId,
            startDate,
            endDate,
            excludeSlotId
        );
    }

    async getAvailableSlots(
        availabilityId: number,
        startDate?: Date,
        endDate?: Date,
        userId?: number
    ): Promise<ItemAvailabilitySlot[]> {
        // Check if user has permission to view this availability
        if (userId) {
            await this.checkAvailabilityPermission(availabilityId, userId);
        }
        
        const filters: ItemAvailabilitySlotFilters = {
            availability_id: availabilityId,
            status: ItemAvailabilitySlotStatus.AVAILABLE
        };
        
        if (startDate) {
            filters.start_date = startDate;
        }
        
        if (endDate) {
            filters.end_date = endDate;
        }
        
        return this.slotsRepository.getSlotsByFilters(filters);
    }

    private async checkSlotPermission(slot: ItemAvailabilitySlot, userId: number): Promise<void> {
        // User can view/manage slots if they are:
        // 1. Owner of the item
        // 2. The person who made the loan request
        
        const availability = await this.itemsRepository.getAvailabilityById(slot.availability_id);
        
        if (!availability) {
            throw new NotFoundException('Availability not found');
        }
        
        const item = await this.itemsRepository.getItemById(availability.item_id);
        
        if (!item) {
            throw new NotFoundException('Item not found');
        }
        
        if (item.owner_id !== userId && slot.loan_request_id) {
            // Check if user is the one who made the loan request
            // This would require checking the loan request, for now we'll assume they can access their own slots
        }
        
        if (item.owner_id !== userId) {
            throw new ForbiddenException('You do not have permission to access this slot');
        }
    }

    private async checkAvailabilityPermission(availabilityId: number, userId: number): Promise<void> {
        const availability = await this.itemsRepository.getAvailabilityById(availabilityId);
        
        if (!availability) {
            throw new NotFoundException('Availability not found');
        }
        
        const item = await this.itemsRepository.getItemById(availability.item_id);
        
        if (!item) {
            throw new NotFoundException('Item not found');
        }
        
        if (item.owner_id !== userId) {
            throw new ForbiddenException('You do not have permission to access this availability');
        }
    }

    private async checkLoanRequestPermission(loanRequestId: number, userId: number): Promise<void> {
        // For now, we'll allow access - this should be properly implemented
        return;
    }
}