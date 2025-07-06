import { useState, useEffect, useCallback } from 'react';
import { ItemAvailabilityModel, ItemAvailabilitySlotStatus } from '@/domain/models/item.model';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
    format, 
    addDays, 
    startOfDay, 
    isSameDay, 
    isWithinInterval,
    differenceInDays,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    getDay,
    addMonths,
    subMonths,
    parseISO
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatDateRange } from '@/utils/availability.utils';
import { validateSlotSelection } from '@/utils/slot-validation.utils';

interface AvailabilityCalendarProps {
    availabilities: ItemAvailabilityModel[];
    onSelectionChange?: (startDate: Date | null, endDate: Date | null, isValid: boolean) => void;
    minDuration?: number;
    maxDuration?: number;
}


interface DayInfo {
    date: Date;
    isInCurrentMonth: boolean;
    isAvailable: boolean;
    isReserved: boolean;
    isOccupied: boolean;
    isSelected: boolean;
    isInSelectionRange: boolean;
    isDisabled: boolean;
}

export default function AvailabilityCalendar({
    availabilities,
    onSelectionChange,
    minDuration = 1,
    maxDuration = 30
}: AvailabilityCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectionStart, setSelectionStart] = useState<Date | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');


    // Générer les jours du calendrier
    const generateCalendarDays = (): DayInfo[] => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const startWeek = addDays(start, -getDay(start) + 1); // Commence le lundi
        const endWeek = addDays(end, 7 - getDay(end));
        
        const days = eachDayOfInterval({ start: startWeek, end: endWeek });
        const today = startOfDay(new Date());

        return days.map(date => {
            const normalizedDate = startOfDay(date);
            const isInCurrentMonth = normalizedDate >= start && normalizedDate <= end;
            
            // Vérifier la disponibilité de ce jour
            let isAvailable = false;
            let isReserved = false;
            let isOccupied = false;


            // D'abord, vérifier si le jour est dans une période de disponibilité
            for (const availability of availabilities) {
                const availStart = startOfDay(new Date(availability.start_date));
                const availEnd = startOfDay(new Date(availability.end_date));
                
                
                if (isWithinInterval(normalizedDate, { start: availStart, end: availEnd })) {
                    // Le jour est dans une période de disponibilité, par défaut il est disponible
                    isAvailable = true;
                    
                    
                    // Maintenant vérifier s'il y a des slots qui l'occupent
                    if (availability.slots && availability.slots.length > 0) {
                        for (const slot of availability.slots) {
                            const slotStart = startOfDay(new Date(slot.start_date));
                            const slotEnd = startOfDay(new Date(slot.end_date));
                            
                            
                            if (isWithinInterval(normalizedDate, { start: slotStart, end: slotEnd })) {
                                
                                // Ce jour est dans un slot occupé/réservé
                                if (slot.status === ItemAvailabilitySlotStatus.RESERVED) {
                                    isReserved = true;
                                    isAvailable = false;
                                } else if (slot.status === ItemAvailabilitySlotStatus.OCCUPIED) {
                                    isOccupied = true;
                                    isAvailable = false;
                                }
                                break; // Sortir de la boucle des slots
                            }
                        }
                    }
                    break; // Sortir de la boucle des availabilities
                }
            }


            const isSelected = selectionStart ? isSameDay(normalizedDate, selectionStart) : false;
            const isInSelectionRange = selectionStart && selectionEnd ? 
                isWithinInterval(normalizedDate, { 
                    start: selectionStart < selectionEnd ? selectionStart : selectionEnd,
                    end: selectionStart < selectionEnd ? selectionEnd : selectionStart
                }) : false;

            const isDisabled = normalizedDate < today || (isReserved || isOccupied) || !isAvailable;

            return {
                date: normalizedDate,
                isInCurrentMonth,
                isAvailable,
                isReserved,
                isOccupied,
                isSelected,
                isInSelectionRange,
                isDisabled
            };
        });
    };

    const calendarDays = generateCalendarDays();

    // Valider la sélection
    const validateSelection = useCallback((start: Date, end: Date): string => {
        return validateSlotSelection(start, end, availabilities, {
            minDuration,
            maxDuration
        });
    }, [minDuration, maxDuration, availabilities]);

    // Gérer le clic sur un jour
    const handleDayClick = (dayInfo: DayInfo) => {
        if (dayInfo.isDisabled) {
            return;
        }

        const clickedDate = dayInfo.date;

        if (!isSelecting) {
            // Commencer une nouvelle sélection
            setSelectionStart(clickedDate);
            setSelectionEnd(null);
            setIsSelecting(true);
            setValidationMessage('');
            // Ne pas notifier encore le parent
        } else {
            // Terminer la sélection (mais ne pas valider automatiquement)
            if (!selectionStart) return;

            // Si on clique sur le même jour, c'est une sélection d'un seul jour
            if (selectionStart.getTime() === clickedDate.getTime()) {
                setSelectionEnd(clickedDate);
                setIsSelecting(false);
                setValidationMessage('');
                // Notifier avec le même jour pour début et fin
                onSelectionChange?.(clickedDate, clickedDate, false);
            } else {
                setSelectionEnd(clickedDate);
                setIsSelecting(false);
                setValidationMessage('');

                // Notifier le parent avec les dates sélectionnées, mais sans marquer comme "valide"
                const start = selectionStart < clickedDate ? selectionStart : clickedDate;
                const end = selectionStart < clickedDate ? clickedDate : selectionStart;
                
                // Notifier la sélection mais laisser le parent faire la validation au moment de l'envoi
                onSelectionChange?.(start, end, false);
            }
        }
    };

    // Réinitialiser la sélection
    const resetSelection = () => {
        setSelectionStart(null);
        setSelectionEnd(null);
        setIsSelecting(false);
        setValidationMessage('');
        onSelectionChange?.(null, null, false);
    };


    // Obtenir les classes CSS pour un jour
    const getDayClasses = (dayInfo: DayInfo): string => {
        const baseClasses = 'aspect-square rounded text-xs font-medium border transition-all cursor-pointer flex items-center justify-center';
        
        // Priorité aux couleurs spécifiques pour les slots occupés/réservés
        if (dayInfo.isOccupied) {
            return `${baseClasses} bg-red-200 text-red-800 border-red-300 cursor-not-allowed`;
        }

        if (dayInfo.isReserved) {
            return `${baseClasses} bg-orange-200 text-orange-800 border-orange-300 cursor-not-allowed`;
        }

        // Puis les états de sélection
        if (dayInfo.isInSelectionRange && selectionStart && selectionEnd) {
            return `${baseClasses} bg-blue-200 text-blue-800 border-blue-300 hover:bg-blue-300`;
        }

        if (dayInfo.isSelected) {
            return `${baseClasses} bg-blue-500 text-white border-blue-600 hover:bg-blue-600`;
        }

        // Les jours disponibles
        if (dayInfo.isAvailable) {
            return `${baseClasses} bg-green-100 text-green-800 border-green-300 hover:bg-green-200`;
        }

        // Les jours désactivés (passés ou hors période)
        if (dayInfo.isDisabled) {
            return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200`;
        }

        if (!dayInfo.isInCurrentMonth) {
            return `${baseClasses} bg-gray-50 text-gray-300 border-gray-200`;
        }

        return `${baseClasses} bg-gray-50 text-gray-600 border-gray-300`;
    };


    useEffect(() => {
        // Juste mettre à jour l'affichage du message de validation, SANS notifier le parent
        if (selectionStart && selectionEnd) {
            const validation = validateSelection(selectionStart, selectionEnd);
            setValidationMessage(validation);
        } else {
            setValidationMessage('');
        }
    }, [selectionStart, selectionEnd, availabilities, validateSelection]);

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <span className="material-symbols-outlined">event_available</span>
                        Sélectionner un créneau
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        >
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </Button>
                        <span className="text-sm font-medium min-w-32 text-center">
                            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        >
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
                {/* Légende compacte */}
                <div className="flex flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-100 border border-green-300 rounded"></div>
                        <span>Libre</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-orange-200 border border-orange-300 rounded"></div>
                        <span>Réservé</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-200 border border-red-300 rounded"></div>
                        <span>Occupé</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-200 border border-blue-300 rounded"></div>
                        <span>Sélection</span>
                    </div>
                </div>

                {/* Instructions compactes */}
                <div className="text-xs text-gray-600 text-center py-1">
                    {isSelecting 
                        ? 'Cliquez sur la date de fin'
                        : 'Cliquez sur une date libre pour commencer'
                    }
                </div>

                {/* Calendrier */}
                <div className="space-y-2">
                    {/* En-têtes des jours */}
                    <div className="grid grid-cols-7 gap-1 text-xs text-center text-gray-500 mb-2">
                        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                            <div key={index} className="py-1 font-medium">{day}</div>
                        ))}
                    </div>

                    {/* Grille des jours */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((dayInfo, index) => (
                            <button
                                key={index}
                                className={getDayClasses(dayInfo)}
                                onClick={() => handleDayClick(dayInfo)}
                                disabled={dayInfo.isDisabled}
                            >
                                {format(dayInfo.date, 'd')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Validation compacte */}
                {validationMessage && (
                    <div className="text-xs text-red-600 text-center py-1">
                        {validationMessage}
                    </div>
                )}

                {selectionStart && selectionEnd && !validationMessage && (
                    <div className="p-2 bg-green-50 rounded text-center">
                        <div className="text-xs text-green-700">
                            {formatDateRange(selectionStart, selectionEnd)} • {differenceInDays(selectionEnd, selectionStart) + 1} jour(s)
                        </div>
                    </div>
                )}

                {/* Actions compactes */}
                {(selectionStart || selectionEnd) && (
                    <div className="text-center">
                        <Button
                            variant="outline"
                            onClick={resetSelection}
                            size="sm"
                        >
                            Recommencer
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}