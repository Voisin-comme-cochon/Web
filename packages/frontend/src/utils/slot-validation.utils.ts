import { differenceInDays, eachDayOfInterval, startOfDay, isWithinInterval } from 'date-fns';
import { ItemAvailabilityModel, ItemAvailabilitySlotStatus } from '@/domain/models/item.model';

export interface SlotValidationOptions {
    minDuration?: number;
    maxDuration?: number;
}

export const validateSlotSelection = (
    startDate: Date,
    endDate: Date,
    availabilities: ItemAvailabilityModel[],
    options: SlotValidationOptions = {}
): string => {
    const { minDuration = 1, maxDuration = 30 } = options;

    if (!startDate || !endDate) {
        return 'Veuillez sélectionner une période';
    }

    const duration = differenceInDays(endDate, startDate) + 1;

    if (duration < minDuration) {
        return `La durée minimale est de ${minDuration} jour(s)`;
    }

    if (duration > maxDuration) {
        return `La durée maximale est de ${maxDuration} jour(s)`;
    }

    // Vérifier que tous les jours de la sélection sont disponibles
    const daysInRange = eachDayOfInterval({ start: startDate, end: endDate });

    for (const day of daysInRange) {
        const normalizedDay = startOfDay(day);
        let dayIsAvailable = false;

        // Vérifier si le jour est dans une période de disponibilité
        for (const availability of availabilities) {
            const availStart = startOfDay(new Date(availability.start_date));
            const availEnd = startOfDay(new Date(availability.end_date));

            if (isWithinInterval(normalizedDay, { start: availStart, end: availEnd })) {
                dayIsAvailable = true;

                // Vérifier s'il y a des slots qui occupent ce jour
                if (availability.slots && availability.slots.length > 0) {
                    for (const slot of availability.slots) {
                        const slotStart = startOfDay(new Date(slot.start_date));
                        const slotEnd = startOfDay(new Date(slot.end_date));

                        if (isWithinInterval(normalizedDay, { start: slotStart, end: slotEnd })) {
                            if (
                                slot.status === ItemAvailabilitySlotStatus.RESERVED ||
                                slot.status === ItemAvailabilitySlotStatus.OCCUPIED
                            ) {
                                return 'Certains jours de la période sélectionnée ne sont pas disponibles';
                            }
                        }
                    }
                }
                break;
            }
        }

        if (!dayIsAvailable) {
            return 'Certains jours de la période sélectionnée ne sont pas disponibles';
        }
    }

    return '';
};
