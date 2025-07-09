import { ItemEntity } from '../../../core/entities/item.entity';
import { ItemAvailabilityEntity } from '../../../core/entities/item-availability.entity';
import { Item, ItemAvailability } from '../domain/item.model';
import { ItemAvailabilitySlotsAdapter } from './item-availability-slots.adapter';

export class ItemsAdapter {
    public static entityToDomain(item: ItemEntity): Item {
        return {
            id: item.id,
            name: item.name,
            description: item.description,
            category: item.category,
            image_url: item.image_url,
            owner_id: item.owner_id,
            neighborhood_id: item.neighborhood_id,
            created_at: item.created_at,
            availabilities: item.availabilities?.map((availability) => this.availabilityEntityToDomain(availability)),
        };
    }

    public static listEntityToDomain(items: ItemEntity[]): Item[] {
        return items.map((item) => this.entityToDomain(item));
    }

    public static availabilityEntityToDomain(availability: ItemAvailabilityEntity): ItemAvailability {
        return {
            id: availability.id,
            item_id: availability.item_id,
            start_date: availability.start_date,
            end_date: availability.end_date,
            status: availability.status,
            created_at: availability.created_at,
            slots: availability.slots.map((slot) => ItemAvailabilitySlotsAdapter.entityToDomain(slot)),
        };
    }

    public static listAvailabilityEntityToDomain(availabilities: ItemAvailabilityEntity[]): ItemAvailability[] {
        return availabilities.map((availability) => this.availabilityEntityToDomain(availability));
    }
}
