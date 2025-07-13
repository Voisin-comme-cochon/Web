import { ItemAvailabilityModel } from '@/domain/models/item.model';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AvailabilityCalendar from '@/components/Items/Availability/AvailabilityCalendar/AvailabilityCalendar';

interface SlotSelectorProps {
    availabilities: ItemAvailabilityModel[];
    onSelectionChange?: (startDate: Date | null, endDate: Date | null, isValid: boolean) => void;
    initialStartDate?: Date;
    initialEndDate?: Date;
    minDuration?: number; // En jours
    maxDuration?: number; // En jours
}

export default function SlotSelector({
    availabilities,
    onSelectionChange,
    initialStartDate,
    initialEndDate,
    minDuration = 1,
    maxDuration = 30
}: SlotSelectorProps) {


    const handleSlotSelectionChange = (startDate: Date | null, endDate: Date | null, isValid: boolean) => {
        onSelectionChange?.(startDate, endDate, isValid);
    };


    return (
        <>
            {/* Calendrier interactif */}
            {availabilities.length > 0 ? (
                <AvailabilityCalendar
                    availabilities={availabilities}
                    onSelectionChange={handleSlotSelectionChange}
                    minDuration={minDuration}
                    maxDuration={maxDuration}
                />
            ) : (
                <Alert variant="destructive">
                    <span className="material-symbols-outlined text-sm">error</span>
                    <AlertDescription>
                        Aucune période de disponibilité définie pour cet objet.
                    </AlertDescription>
                </Alert>
            )}
        </>
    );
}