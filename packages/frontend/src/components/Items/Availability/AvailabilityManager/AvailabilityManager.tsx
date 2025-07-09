import { ItemModel, CreateItemAvailabilityRequest } from '@/domain/models/item.model';
import { useItemAvailabilities } from '@/presentation/hooks/useItems';
import UnifiedAvailabilityCalendar from '@/components/Items/Availability/UnifiedAvailabilityCalendar/UnifiedAvailabilityCalendar';

interface AvailabilityManagerProps {
    item: ItemModel;
    currentUserId: number;
}

export default function AvailabilityManager({ item, currentUserId }: AvailabilityManagerProps) {
    const { availabilities, loading, error, createAvailability, deleteAvailability, refetch } = useItemAvailabilities(
        item.id
    );

    const isOwner = item.owner_id === currentUserId;

    const handleCreateAvailability = async (request: CreateItemAvailabilityRequest): Promise<boolean> => {
        const success = await createAvailability(request);
        if (success) {
            refetch();
        }
        return success;
    };

    const handleDeleteAvailability = async (availabilityId: number): Promise<boolean> => {
        const success = await deleteAvailability(availabilityId);
        if (success) {
            refetch();
        }
        return success;
    };

    if (!isOwner) {
        return (
            <UnifiedAvailabilityCalendar
                availabilities={availabilities}
                onCreateAvailability={handleCreateAvailability}
                onDeleteAvailability={handleDeleteAvailability}
                loading={loading}
                canManage={false}
                itemId={item.id}
            />
        );
    }

    return (
        <UnifiedAvailabilityCalendar
            availabilities={availabilities}
            onCreateAvailability={handleCreateAvailability}
            onDeleteAvailability={handleDeleteAvailability}
            loading={loading}
            canManage={true}
            itemId={item.id}
        />
    );
}
