import { ItemAvailabilitySlotEntity } from '../../../core/entities/item-availability-slot.entity';
import { ItemAvailabilitySlot } from '../domain/item-availability-slot.model';

export class ItemAvailabilitySlotsAdapter {
    static entityToDomain(entity: ItemAvailabilitySlotEntity): ItemAvailabilitySlot {
        return {
            id: entity.id,
            availability_id: entity.availability_id,
            start_date: entity.start_date,
            end_date: entity.end_date,
            status: entity.status,
            loan_request_id: entity.loan_request_id,
            created_at: entity.created_at,
        };
    }

    static domainToEntity(domain: ItemAvailabilitySlot): ItemAvailabilitySlotEntity {
        const entity = new ItemAvailabilitySlotEntity();
        entity.id = domain.id;
        entity.availability_id = domain.availability_id;
        entity.start_date = domain.start_date;
        entity.end_date = domain.end_date;
        entity.status = domain.status;
        entity.loan_request_id = domain.loan_request_id;
        entity.created_at = domain.created_at;
        return entity;
    }
}
