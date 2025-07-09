import {
    ItemAvailabilityModel,
    ItemAvailabilitySlotModel,
    ItemAvailabilitySlotStatus,
} from '@/domain/models/item.model';
import { startOfDay, endOfDay, isWithinInterval, differenceInDays, addDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface AvailableSlot {
    start_date: Date;
    end_date: Date;
    duration_days: number;
}

export interface SlotConflict {
    conflicting_slot: ItemAvailabilitySlotModel;
    requested_start: Date;
    requested_end: Date;
    overlap_start: Date;
    overlap_end: Date;
}

export interface AvailabilityStatus {
    is_available: boolean;
    is_partially_available: boolean;
    available_days: number;
    total_days: number;
    conflicts: SlotConflict[];
    available_slots: AvailableSlot[];
}

/**
 * Calcule les créneaux libres dans une période de disponibilité
 */
export function getAvailableSlots(
    availability: ItemAvailabilityModel,
    requestedStart?: Date,
    requestedEnd?: Date
): AvailableSlot[] {
    if (!availability.slots || availability.slots.length === 0) {
        // Si pas de slots, toute la période est disponible
        const start = requestedStart
            ? new Date(Math.max(requestedStart.getTime(), availability.start_date.getTime()))
            : availability.start_date;
        const end = requestedEnd
            ? new Date(Math.min(requestedEnd.getTime(), availability.end_date.getTime()))
            : availability.end_date;

        if (start <= end) {
            return [
                {
                    start_date: start,
                    end_date: end,
                    duration_days: differenceInDays(end, start) + 1,
                },
            ];
        }
        return [];
    }

    const availableSlots: AvailableSlot[] = [];
    const occupiedSlots = availability.slots
        .filter(
            (slot) =>
                slot.status === ItemAvailabilitySlotStatus.RESERVED ||
                slot.status === ItemAvailabilitySlotStatus.OCCUPIED
        )
        .sort((a, b) => a.start_date.getTime() - b.start_date.getTime());

    let currentStart = availability.start_date;

    for (const slot of occupiedSlots) {
        // Vérifier s'il y a un créneau libre avant ce slot
        if (currentStart < slot.start_date) {
            const slotEnd = new Date(Math.min(slot.start_date.getTime() - 86400000, availability.end_date.getTime())); // -1 jour
            if (currentStart <= slotEnd) {
                // Appliquer les filtres de date si fournis
                const filteredStart = requestedStart
                    ? new Date(Math.max(currentStart.getTime(), requestedStart.getTime()))
                    : currentStart;
                const filteredEnd = requestedEnd
                    ? new Date(Math.min(slotEnd.getTime(), requestedEnd.getTime()))
                    : slotEnd;

                if (filteredStart <= filteredEnd) {
                    availableSlots.push({
                        start_date: filteredStart,
                        end_date: filteredEnd,
                        duration_days: differenceInDays(filteredEnd, filteredStart) + 1,
                    });
                }
            }
        }
        currentStart = new Date(slot.end_date.getTime() + 86400000); // +1 jour après la fin du slot
    }

    // Vérifier s'il y a un créneau libre après le dernier slot
    if (currentStart <= availability.end_date) {
        const filteredStart = requestedStart
            ? new Date(Math.max(currentStart.getTime(), requestedStart.getTime()))
            : currentStart;
        const filteredEnd = requestedEnd
            ? new Date(Math.min(availability.end_date.getTime(), requestedEnd.getTime()))
            : availability.end_date;

        if (filteredStart <= filteredEnd) {
            availableSlots.push({
                start_date: filteredStart,
                end_date: filteredEnd,
                duration_days: differenceInDays(filteredEnd, filteredStart) + 1,
            });
        }
    }

    return availableSlots;
}

/**
 * Détecte les conflits entre une demande et les slots existants
 */
export function getSlotConflicts(
    availability: ItemAvailabilityModel,
    requestedStart: Date,
    requestedEnd: Date
): SlotConflict[] {
    if (!availability.slots) return [];

    const conflicts: SlotConflict[] = [];
    const normalizedRequestStart = startOfDay(requestedStart);
    const normalizedRequestEnd = endOfDay(requestedEnd);

    for (const slot of availability.slots) {
        if (
            slot.status === ItemAvailabilitySlotStatus.RESERVED ||
            slot.status === ItemAvailabilitySlotStatus.OCCUPIED
        ) {
            const slotStart = startOfDay(slot.start_date);
            const slotEnd = endOfDay(slot.end_date);

            // Vérifier s'il y a chevauchement
            const hasOverlap = normalizedRequestStart <= slotEnd && normalizedRequestEnd >= slotStart;

            if (hasOverlap) {
                const overlapStart = new Date(Math.max(normalizedRequestStart.getTime(), slotStart.getTime()));
                const overlapEnd = new Date(Math.min(normalizedRequestEnd.getTime(), slotEnd.getTime()));

                conflicts.push({
                    conflicting_slot: slot,
                    requested_start: requestedStart,
                    requested_end: requestedEnd,
                    overlap_start: overlapStart,
                    overlap_end: overlapEnd,
                });
            }
        }
    }

    return conflicts;
}

/**
 * Calcule le statut global de disponibilité d'une période
 */
export function calculateAvailabilityStatus(
    availability: ItemAvailabilityModel,
    requestedStart?: Date,
    requestedEnd?: Date
): AvailabilityStatus {
    const conflicts =
        requestedStart && requestedEnd ? getSlotConflicts(availability, requestedStart, requestedEnd) : [];

    const availableSlots = getAvailableSlots(availability, requestedStart, requestedEnd);

    const totalDays =
        requestedStart && requestedEnd
            ? differenceInDays(requestedEnd, requestedStart) + 1
            : differenceInDays(availability.end_date, availability.start_date) + 1;

    const availableDays = availableSlots.reduce((sum, slot) => sum + slot.duration_days, 0);

    return {
        is_available: conflicts.length === 0 && availableDays === totalDays,
        is_partially_available: availableDays > 0 && availableDays < totalDays,
        available_days: availableDays,
        total_days: totalDays,
        conflicts,
        available_slots: availableSlots,
    };
}

/**
 * Suggère des créneaux alternatifs proches de la demande
 */
export function suggestAlternativeSlots(
    availabilities: ItemAvailabilityModel[],
    requestedStart: Date,
    requestedEnd: Date,
    maxSuggestions: number = 3
): AvailableSlot[] {
    const requestedDuration = differenceInDays(requestedEnd, requestedStart) + 1;
    const suggestions: (AvailableSlot & { distance: number })[] = [];

    for (const availability of availabilities) {
        const availableSlots = getAvailableSlots(availability);

        for (const slot of availableSlots) {
            if (slot.duration_days >= requestedDuration) {
                // Calculer la distance temporelle avec la demande originale
                const distance = Math.min(
                    Math.abs(differenceInDays(slot.start_date, requestedStart)),
                    Math.abs(differenceInDays(slot.end_date, requestedEnd))
                );

                suggestions.push({
                    ...slot,
                    distance,
                });
            }
        }
    }

    // Trier par distance et prendre les meilleures suggestions
    return suggestions
        .sort((a, b) => a.distance - b.distance)
        .slice(0, maxSuggestions)
        .map(({ distance, ...slot }) => slot);
}

/**
 * Formate une période pour l'affichage utilisateur
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
    const start = format(startDate, 'dd MMM', { locale: fr });
    const end = format(endDate, 'dd MMM yyyy', { locale: fr });

    if (startDate.getTime() === endDate.getTime()) {
        return format(startDate, 'dd MMM yyyy', { locale: fr });
    }

    return `Du ${start} au ${end}`;
}

/**
 * Génère un message d'erreur convivial pour les conflits
 */
export function getConflictMessage(conflicts: SlotConflict[]): string {
    if (conflicts.length === 0) return '';

    if (conflicts.length === 1) {
        const conflict = conflicts[0];
        const conflictRange = formatDateRange(conflict.conflicting_slot.start_date, conflict.conflicting_slot.end_date);
        const status = conflict.conflicting_slot.status === ItemAvailabilitySlotStatus.RESERVED ? 'réservé' : 'occupé';
        return `Ce créneau se chevauche avec une période déjà ${status} (${conflictRange})`;
    }

    return `Ce créneau entre en conflit avec ${conflicts.length} réservations existantes`;
}

/**
 * Vérifie si une date est disponible dans toutes les availabilities
 */
export function isDateAvailable(availabilities: ItemAvailabilityModel[], date: Date): boolean {
    const targetDate = startOfDay(date);

    for (const availability of availabilities) {
        const availStart = startOfDay(availability.start_date);
        const availEnd = endOfDay(availability.end_date);

        // Vérifier si la date est dans cette période de disponibilité
        if (isWithinInterval(targetDate, { start: availStart, end: availEnd })) {
            // Vérifier s'il y a des slots qui bloquent cette date
            if (availability.slots) {
                for (const slot of availability.slots) {
                    if (
                        slot.status === ItemAvailabilitySlotStatus.RESERVED ||
                        slot.status === ItemAvailabilitySlotStatus.OCCUPIED
                    ) {
                        const slotStart = startOfDay(slot.start_date);
                        const slotEnd = endOfDay(slot.end_date);

                        if (isWithinInterval(targetDate, { start: slotStart, end: slotEnd })) {
                            return false; // Date bloquée par ce slot
                        }
                    }
                }
            }
            return true; // Date disponible dans cette availability
        }
    }

    return false; // Date pas dans aucune availability
}
