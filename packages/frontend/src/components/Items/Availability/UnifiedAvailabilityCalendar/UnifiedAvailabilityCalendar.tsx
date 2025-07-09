import { useState, useCallback } from 'react';
import { 
    ItemAvailabilityModel, 
    ItemAvailabilitySlotStatus,
    CreateItemAvailabilityRequest 
} from '@/domain/models/item.model';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    format, 
    addDays, 
    startOfDay, 
    isSameDay, 
    isWithinInterval,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    getDay,
    addMonths,
    subMonths,
    isBefore,
    isAfter
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/presentation/hooks/useToast';

interface UnifiedAvailabilityCalendarProps {
    availabilities: ItemAvailabilityModel[];
    onCreateAvailability: (request: CreateItemAvailabilityRequest) => Promise<boolean>;
    onDeleteAvailability: (availabilityId: number) => Promise<boolean>;
    loading: boolean;
    canManage: boolean;
    itemId: number;
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
    availability?: ItemAvailabilityModel;
    isToday: boolean;
}

export default function UnifiedAvailabilityCalendar({
    availabilities,
    onCreateAvailability,
    onDeleteAvailability,
    loading,
    canManage,
    itemId
}: UnifiedAvailabilityCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectionStart, setSelectionStart] = useState<Date | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedAvailability, setSelectedAvailability] = useState<ItemAvailabilityModel | null>(null);
    const { showError } = useToast();

    // Vérifier si une date est dans une période existante
    const getDateInfo = useCallback((date: Date) => {
        const normalizedDate = startOfDay(date);
        
        for (const availability of availabilities) {
            const availStart = startOfDay(new Date(availability.start_date));
            const availEnd = startOfDay(new Date(availability.end_date));
            
            if (isWithinInterval(normalizedDate, { start: availStart, end: availEnd })) {
                // Vérifier s'il y a des slots pour cette date
                const slot = availability.slots?.find(s => {
                    const slotStart = startOfDay(new Date(s.start_date));
                    const slotEnd = startOfDay(new Date(s.end_date));
                    return isWithinInterval(normalizedDate, { start: slotStart, end: slotEnd });
                });

                return {
                    availability,
                    slot,
                    isAvailable: !slot || slot.status === ItemAvailabilitySlotStatus.AVAILABLE,
                    isReserved: slot?.status === ItemAvailabilitySlotStatus.RESERVED,
                    isOccupied: slot?.status === ItemAvailabilitySlotStatus.OCCUPIED
                };
            }
        }
        
        return null;
    }, [availabilities]);

    // Vérifier si une nouvelle sélection chevauche avec les existantes
    const wouldOverlap = useCallback((start: Date, end: Date) => {
        const normalizedStart = startOfDay(start);
        const normalizedEnd = startOfDay(end);
        
        for (const availability of availabilities) {
            const availStart = startOfDay(new Date(availability.start_date));
            const availEnd = startOfDay(new Date(availability.end_date));
            
            // Vérifie s'il y a chevauchement
            if (normalizedStart <= availEnd && normalizedEnd >= availStart) {
                return true;
            }
        }
        
        return false;
    }, [availabilities]);

    // Générer les jours du calendrier avec positionnement correct
    const generateCalendarDays = (): DayInfo[] => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        
        // Calculer le début de la semaine (lundi = 1, dimanche = 0)
        const startDay = getDay(start);
        const daysToSubtract = startDay === 0 ? 6 : startDay - 1; // Lundi = 0 jours à soustraire
        const startWeek = addDays(start, -daysToSubtract);
        
        // Calculer la fin de la semaine
        const endDay = getDay(end);
        const daysToAdd = endDay === 0 ? 0 : 7 - endDay; // Dimanche = 0 jours à ajouter
        const endWeek = addDays(end, daysToAdd);
        
        const days = eachDayOfInterval({ start: startWeek, end: endWeek });
        const today = startOfDay(new Date());

        return days.map(date => {
            const normalizedDate = startOfDay(date);
            const isInCurrentMonth = normalizedDate >= start && normalizedDate <= end;
            const dateInfo = getDateInfo(normalizedDate);
            
            const isSelected = selectionStart ? isSameDay(normalizedDate, selectionStart) : false;
            const isInSelectionRange = selectionStart && selectionEnd ? 
                isWithinInterval(normalizedDate, { 
                    start: selectionStart < selectionEnd ? selectionStart : selectionEnd,
                    end: selectionStart < selectionEnd ? selectionEnd : selectionStart
                }) : false;

            const isPastDate = isBefore(normalizedDate, today);
            const isInExistingAvailability = !!dateInfo;
            
            return {
                date: normalizedDate,
                isInCurrentMonth,
                isAvailable: dateInfo?.isAvailable || false,
                isReserved: dateInfo?.isReserved || false,
                isOccupied: dateInfo?.isOccupied || false,
                isSelected,
                isInSelectionRange,
                isDisabled: isPastDate || (!canManage && !isInExistingAvailability),
                availability: dateInfo?.availability,
                isToday: isSameDay(normalizedDate, today)
            };
        });
    };

    const calendarDays = generateCalendarDays();

    // Gérer le clic sur un jour
    const handleDayClick = (dayInfo: DayInfo) => {
        if (!canManage || dayInfo.isDisabled) return;

        // Si on clique sur une disponibilité existante, la sélectionner pour affichage/suppression
        if (dayInfo.availability) {
            setSelectedAvailability(dayInfo.availability);
            return;
        }

        const clickedDate = dayInfo.date;

        if (!isSelecting) {
            // Commencer une nouvelle sélection
            setSelectionStart(clickedDate);
            setSelectionEnd(null);
            setIsSelecting(true);
        } else {
            // Terminer la sélection
            if (!selectionStart) return;

            const start = selectionStart < clickedDate ? selectionStart : clickedDate;
            const end = selectionStart < clickedDate ? clickedDate : selectionStart;
            
            setSelectionEnd(end);
            setIsSelecting(false);

            // Vérifier les chevauchements avant de créer
            if (wouldOverlap(start, end)) {
                showError(
                    'Période non disponible',
                    'Cette période chevauche avec une disponibilité existante. Veuillez choisir d\'autres dates.'
                );
                resetSelection();
                return;
            }

            // Créer la nouvelle disponibilité
            createNewAvailability(start, end);
        }
    };

    // Créer une nouvelle disponibilité
    const createNewAvailability = async (start: Date, end: Date) => {
        const request: CreateItemAvailabilityRequest = {
            item_id: itemId,
            start_date: start,
            end_date: end
        };

        const success = await onCreateAvailability(request);
        if (success) {
            resetSelection();
        }
    };

    // Réinitialiser la sélection
    const resetSelection = () => {
        setSelectionStart(null);
        setSelectionEnd(null);
        setIsSelecting(false);
    };

    // Supprimer une disponibilité
    const handleDeleteAvailability = async () => {
        if (!selectedAvailability) return;
        
        const success = await onDeleteAvailability(selectedAvailability.id);
        if (success) {
            setSelectedAvailability(null);
        }
    };

    // Obtenir les classes CSS pour un jour
    const getDayClasses = (dayInfo: DayInfo): string => {
        const baseClasses = 'aspect-square rounded text-xs font-medium border transition-all cursor-pointer flex items-center justify-center relative';
        
        // Priorité aux couleurs spécifiques
        if (dayInfo.isOccupied) {
            return `${baseClasses} bg-red-200 text-red-800 border-red-300 cursor-default`;
        }

        if (dayInfo.isReserved) {
            return `${baseClasses} bg-orange-200 text-orange-800 border-orange-300 cursor-default`;
        }

        if (dayInfo.availability && dayInfo.isAvailable) {
            return `${baseClasses} bg-green-200 text-green-800 border-green-300 hover:bg-green-300`;
        }

        // États de sélection
        if (dayInfo.isInSelectionRange && selectionStart && selectionEnd) {
            return `${baseClasses} bg-blue-200 text-blue-800 border-blue-300`;
        }

        if (dayInfo.isSelected) {
            return `${baseClasses} bg-blue-500 text-white border-blue-600`;
        }

        // Jour aujourd'hui
        if (dayInfo.isToday && !dayInfo.availability) {
            return `${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200`;
        }

        // Jours désactivés
        if (dayInfo.isDisabled) {
            return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200`;
        }

        if (!dayInfo.isInCurrentMonth) {
            return `${baseClasses} bg-gray-50 text-gray-300 border-gray-200 cursor-default`;
        }

        // Jours libres sélectionnables
        if (canManage) {
            return `${baseClasses} bg-white text-gray-700 border-gray-300 hover:bg-gray-50`;
        }

        return `${baseClasses} bg-gray-50 text-gray-600 border-gray-300 cursor-default`;
    };

    return (
        <TooltipProvider>
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <span className="material-symbols-outlined">calendar_month</span>
                            {canManage ? 'Gestion des disponibilités' : 'Disponibilités'}
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
                    {/* Légende */}
                    <div className="flex flex-wrap gap-3 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-200 border border-green-300 rounded"></div>
                            <span>Disponible</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-orange-200 border border-orange-300 rounded"></div>
                            <span>Réservé</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-200 border border-red-300 rounded"></div>
                            <span>Occupé</span>
                        </div>
                        {canManage && (
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-blue-200 border border-blue-300 rounded"></div>
                                <span>Nouvelle sélection</span>
                            </div>
                        )}
                    </div>

                    {canManage && (
                        <div className="text-xs text-gray-600 text-center py-2 bg-blue-50 rounded">
                            {isSelecting 
                                ? 'Cliquez sur la date de fin de la période'
                                : 'Cliquez sur une date libre pour commencer à créer une disponibilité'
                            }
                        </div>
                    )}

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
                                <Tooltip key={index}>
                                    <TooltipTrigger asChild>
                                        <button
                                            className={getDayClasses(dayInfo)}
                                            onClick={() => handleDayClick(dayInfo)}
                                            disabled={dayInfo.isDisabled && !dayInfo.availability}
                                        >
                                            {format(dayInfo.date, 'd')}
                                            {dayInfo.isToday && (
                                                <div className="absolute bottom-0 right-0 w-1 h-1 bg-yellow-500 rounded-full"></div>
                                            )}
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <div className="text-center">
                                            <div className="font-medium">
                                                {format(dayInfo.date, 'dd MMM yyyy', { locale: fr })}
                                            </div>
                                            {dayInfo.availability && (
                                                <div className="text-xs mt-1">
                                                    Disponibilité du {format(new Date(dayInfo.availability.start_date), 'dd/MM')} 
                                                    {' au '} {format(new Date(dayInfo.availability.end_date), 'dd/MM')}
                                                </div>
                                            )}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                    </div>

                    {/* Actions pour la sélection en cours */}
                    {(selectionStart || selectionEnd) && canManage && (
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm">
                                {selectionStart && selectionEnd ? (
                                    <span>
                                        Période sélectionnée : {format(selectionStart, 'dd MMM')} - {format(selectionEnd, 'dd MMM')}
                                    </span>
                                ) : (
                                    <span>
                                        Début : {selectionStart ? format(selectionStart, 'dd MMM') : 'Non défini'}
                                    </span>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={resetSelection}
                            >
                                Annuler
                            </Button>
                        </div>
                    )}

                    {/* Détails de la disponibilité sélectionnée */}
                    {selectedAvailability && canManage && (
                        <div className="p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Disponibilité sélectionnée</h4>
                                    <p className="text-sm text-gray-600">
                                        Du {format(new Date(selectedAvailability.start_date), 'dd MMM')} 
                                        {' au '} {format(new Date(selectedAvailability.end_date), 'dd MMM yyyy')}
                                    </p>
                                    {selectedAvailability.slots && selectedAvailability.slots.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {selectedAvailability.slots.map((slot) => (
                                                <Badge
                                                    key={slot.id}
                                                    variant={
                                                        slot.status === ItemAvailabilitySlotStatus.OCCUPIED
                                                            ? 'destructive'
                                                            : slot.status === ItemAvailabilitySlotStatus.RESERVED
                                                              ? 'secondary'
                                                              : 'default'
                                                    }
                                                    className="text-xs"
                                                >
                                                    {format(new Date(slot.start_date), 'dd/MM')} - 
                                                    {format(new Date(slot.end_date), 'dd/MM')}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedAvailability(null)}
                                    >
                                        Fermer
                                    </Button>
                                    {/* Affichage conditionnel du bouton de suppression */}
                                    {(!selectedAvailability.slots || 
                                      selectedAvailability.slots.every(s => s.status === ItemAvailabilitySlotStatus.AVAILABLE)) ? (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleDeleteAvailability}
                                            disabled={loading}
                                        >
                                            <span className="material-symbols-outlined text-sm mr-1">delete</span>
                                            Supprimer
                                        </Button>
                                    ) : (
                                        <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                            <span className="material-symbols-outlined text-xs mr-1">lock</span>
                                            Suppression impossible : cette disponibilité contient des réservations actives
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Aide */}
                    <Alert>
                        <span className="material-symbols-outlined text-sm">info</span>
                        <AlertDescription>
                            {canManage 
                                ? (
                                    <div className="space-y-1">
                                        <div>• <strong>Créer :</strong> Cliquez sur les dates libres pour créer des disponibilités</div>
                                        <div>• <strong>Consulter :</strong> Cliquez sur une disponibilité existante pour voir les détails</div>
                                        <div>• <strong>Supprimer :</strong> Possible uniquement si aucune réservation active</div>
                                    </div>
                                )
                                : "Les zones vertes indiquent les périodes où l'objet peut être emprunté."
                            }
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}