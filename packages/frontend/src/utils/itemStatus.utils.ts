import { ItemAvailabilityStatus, ItemAvailabilitySlotStatus } from '@/domain/models/item.model';

export type ItemStatusKey = 
    | 'available_now'
    | 'occupied'
    | 'future_availability'
    | 'no_availability';

export interface ItemStatusInfo {
    key: ItemStatusKey;
    label: string;
    color: string;
}

/**
 * Vérifie si une date donnée est occupée dans une disponibilité
 * en tenant compte des slots réservés ou occupés
 */
function isDateOccupiedInAvailability(availability: any, date: Date): boolean {
    if (!availability.slots || availability.slots.length === 0) {
        return false;
    }

    return availability.slots.some((slot: any) => {
        const slotStart = new Date(slot.start_date);
        const slotEnd = new Date(slot.end_date);
        
        const isInRange = date >= slotStart && date <= slotEnd;
        const isOccupiedOrReserved = slot.status === ItemAvailabilitySlotStatus.OCCUPIED || slot.status === ItemAvailabilitySlotStatus.RESERVED;
        
        return isInRange && isOccupiedOrReserved;
    });
}

/**
 * Calcule le statut d'un item basé sur ses disponibilités, slots et la date actuelle
 * Cette fonction prend en compte les slots occupés/réservés dans les périodes de disponibilité
 * 
 * @param item - L'item à analyser
 * @returns L'information de statut de l'item
 */
export function getItemStatusInfo(item: any): ItemStatusInfo {
    // Pas de disponibilités
    if (!item.availabilities || item.availabilities.length === 0) {
        return {
            key: 'no_availability',
            label: 'Pas de disponibilité',
            color: 'bg-gray-100 text-gray-800'
        };
    }

    const now = new Date();
    const activeAvailabilities = item.availabilities.filter(
        (a: any) => new Date(a.start_date) <= now && new Date(a.end_date) >= now
    );

    // Aucune disponibilité active actuellement
    if (activeAvailabilities.length === 0) {
        // Vérifier s'il y a des disponibilités futures
        const futureAvailabilities = item.availabilities.filter(
            (a: any) => new Date(a.start_date) > now
        );
        
        if (futureAvailabilities.length > 0) {
            return {
                key: 'future_availability',
                label: 'Disponible plus tard',
                color: 'bg-blue-100 text-blue-800'
            };
        }
        
        return {
            key: 'no_availability',
            label: 'Pas de disponibilité',
            color: 'bg-gray-100 text-gray-800'
        };
    }

    // Analyser les disponibilités actives en tenant compte des slots
    let availableCount = 0;
    let partiallyAvailableCount = 0;
    let occupiedCount = 0;

    for (const availability of activeAvailabilities) {
        // Si la disponibilité n'est pas disponible, elle compte comme occupée
        if (availability.status !== ItemAvailabilityStatus.AVAILABLE) {
            occupiedCount++;
            continue;
        }

        // Vérifier si la date actuelle est occupée dans cette disponibilité
        if (isDateOccupiedInAvailability(availability, now)) {
            occupiedCount++;
        } else {
            // Vérifier s'il y a des slots mais pas tous occupés (partiellement disponible)
            if (availability.slots && availability.slots.length > 0) {
                const hasOccupiedSlots = availability.slots.some((slot: any) => 
                    slot.status === ItemAvailabilitySlotStatus.OCCUPIED || 
                    slot.status === ItemAvailabilitySlotStatus.RESERVED
                );
                
                if (hasOccupiedSlots) {
                    partiallyAvailableCount++;
                } else {
                    availableCount++;
                }
            } else {
                availableCount++;
            }
        }
    }

    // Prioriser les statuts dans l'ordre : disponible > occupé
    if (availableCount > 0 && occupiedCount === 0) {
        return {
            key: 'available_now',
            label: 'Disponible maintenant',
            color: 'bg-green-100 text-green-800'
        };
    }
    
    // Cas par défaut : occupé (dès qu'il y a des occupations)
    return {
        key: 'occupied',
        label: 'Occupé',
        color: 'bg-orange-100 text-orange-800'
    };
}

/**
 * Filtre les items par statut
 * 
 * @param items - Liste des items à filtrer
 * @param statusFilter - Le statut à filtrer ('all' pour tous)
 * @returns Liste des items filtrés
 */
export function filterItemsByStatus(items: any[], statusFilter: string): any[] {
    if (!statusFilter || statusFilter === 'all') {
        return items;
    }

    return items.filter(item => {
        const statusInfo = getItemStatusInfo(item);
        return statusInfo.key === statusFilter;
    });
}