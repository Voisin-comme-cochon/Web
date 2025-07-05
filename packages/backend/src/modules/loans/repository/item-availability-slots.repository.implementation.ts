import { DataSource } from 'typeorm';
import { ItemAvailabilitySlotEntity } from '../../../core/entities/item-availability-slot.entity';
import { ItemAvailabilitySlotsRepository } from '../domain/item-availability-slots.abstract.repository';
import {
    ItemAvailabilitySlot,
    CreateItemAvailabilitySlotRequest,
    UpdateItemAvailabilitySlotRequest,
    ItemAvailabilitySlotFilters,
} from '../domain/item-availability-slot.model';
import { ItemAvailabilitySlotsAdapter } from '../adapters/item-availability-slots.adapter';

export class ItemAvailabilitySlotsRepositoryImplementation implements ItemAvailabilitySlotsRepository {
    constructor(private readonly dataSource: DataSource) {}

    async getSlotById(id: number): Promise<ItemAvailabilitySlot | null> {
        const slot = await this.dataSource.getRepository(ItemAvailabilitySlotEntity).findOne({
            where: { id },
            relations: ['availability', 'loan_request'],
        });

        if (!slot) {
            return null;
        }

        return ItemAvailabilitySlotsAdapter.entityToDomain(slot);
    }

    async getSlotsByAvailabilityId(availabilityId: number): Promise<ItemAvailabilitySlot[]> {
        const slots = await this.dataSource.getRepository(ItemAvailabilitySlotEntity).find({
            where: { availability_id: availabilityId },
            relations: ['availability', 'loan_request'],
            order: { start_date: 'ASC' },
        });

        return slots.map((slot) => ItemAvailabilitySlotsAdapter.entityToDomain(slot));
    }

    async getSlotsByLoanRequestId(loanRequestId: number): Promise<ItemAvailabilitySlot[]> {
        const slots = await this.dataSource.getRepository(ItemAvailabilitySlotEntity).find({
            where: { loan_request_id: loanRequestId },
            relations: ['availability', 'loan_request'],
            order: { start_date: 'ASC' },
        });

        return slots.map((slot) => ItemAvailabilitySlotsAdapter.entityToDomain(slot));
    }

    async getSlotsByFilters(filters: ItemAvailabilitySlotFilters): Promise<ItemAvailabilitySlot[]> {
        const queryBuilder = this.dataSource
            .getRepository(ItemAvailabilitySlotEntity)
            .createQueryBuilder('slot')
            .leftJoinAndSelect('slot.availability', 'availability')
            .leftJoinAndSelect('slot.loan_request', 'loan_request')
            .orderBy('slot.start_date', 'ASC');

        if (filters.availability_id) {
            queryBuilder.andWhere('slot.availability_id = :availabilityId', {
                availabilityId: filters.availability_id,
            });
        }

        if (filters.status) {
            queryBuilder.andWhere('slot.status = :status', { status: filters.status });
        }

        if (filters.loan_request_id) {
            queryBuilder.andWhere('slot.loan_request_id = :loanRequestId', {
                loanRequestId: filters.loan_request_id,
            });
        }

        if (filters.start_date) {
            queryBuilder.andWhere('slot.start_date >= :startDate', { startDate: filters.start_date });
        }

        if (filters.end_date) {
            queryBuilder.andWhere('slot.end_date <= :endDate', { endDate: filters.end_date });
        }

        const slots = await queryBuilder.getMany();
        return slots.map((slot) => ItemAvailabilitySlotsAdapter.entityToDomain(slot));
    }

    async createSlot(slot: CreateItemAvailabilitySlotRequest): Promise<ItemAvailabilitySlotEntity> {
        const slotEntity = this.dataSource.getRepository(ItemAvailabilitySlotEntity).create(slot);
        return this.dataSource.getRepository(ItemAvailabilitySlotEntity).save(slotEntity);
    }

    async updateSlot(id: number, slot: UpdateItemAvailabilitySlotRequest): Promise<void> {
        await this.dataSource.getRepository(ItemAvailabilitySlotEntity).update(id, slot);
    }

    async deleteSlot(id: number): Promise<void> {
        await this.dataSource.getRepository(ItemAvailabilitySlotEntity).delete(id);
    }

    async checkSlotOverlap(
        availabilityId: number,
        startDate: Date,
        endDate: Date,
        excludeSlotId?: number
    ): Promise<boolean> {
        const queryBuilder = this.dataSource
            .getRepository(ItemAvailabilitySlotEntity)
            .createQueryBuilder('slot')
            .where('slot.availability_id = :availabilityId', { availabilityId })
            .andWhere(
                '(slot.start_date < :endDate AND slot.end_date > :startDate)',
                { startDate, endDate }
            );

        if (excludeSlotId) {
            queryBuilder.andWhere('slot.id != :excludeSlotId', { excludeSlotId });
        }

        const overlappingSlot = await queryBuilder.getOne();
        return !!overlappingSlot;
    }

    async getOverlappingSlots(
        availabilityId: number,
        startDate: Date,
        endDate: Date,
        excludeSlotId?: number
    ): Promise<ItemAvailabilitySlot[]> {
        const queryBuilder = this.dataSource
            .getRepository(ItemAvailabilitySlotEntity)
            .createQueryBuilder('slot')
            .leftJoinAndSelect('slot.availability', 'availability')
            .leftJoinAndSelect('slot.loan_request', 'loan_request')
            .where('slot.availability_id = :availabilityId', { availabilityId })
            .andWhere(
                '(slot.start_date < :endDate AND slot.end_date > :startDate)',
                { startDate, endDate }
            )
            .orderBy('slot.start_date', 'ASC');

        if (excludeSlotId) {
            queryBuilder.andWhere('slot.id != :excludeSlotId', { excludeSlotId });
        }

        const slots = await queryBuilder.getMany();
        return slots.map((slot) => ItemAvailabilitySlotsAdapter.entityToDomain(slot));
    }
}