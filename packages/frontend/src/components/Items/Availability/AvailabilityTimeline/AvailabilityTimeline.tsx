import { useState } from 'react';
import { ItemAvailabilityModel, ItemAvailabilitySlotModel, ItemAvailabilitySlotStatus } from '@/domain/models/item.model';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatDateRange, getAvailableSlots } from '@/utils/availability.utils';
import { format, differenceInDays, addDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AvailabilityTimelineProps {
    availability: ItemAvailabilityModel;
    onCancelReservation?: (slotId: number) => void;
    onModifyAvailability?: (availabilityId: number) => void;
    canManage?: boolean;
}

export default function AvailabilityTimeline({ 
    availability, 
    onCancelReservation, 
    onModifyAvailability,
    canManage = false 
}: AvailabilityTimelineProps) {
    const [selectedSlot, setSelectedSlot] = useState<ItemAvailabilitySlotModel | null>(null);

    const totalDays = differenceInDays(availability.end_date, availability.start_date) + 1;
    const availableSlots = getAvailableSlots(availability);

    // Générer la timeline jour par jour
    const generateTimeline = () => {
        const timeline: Array<{
            date: Date;
            dayIndex: number;
            slot?: ItemAvailabilitySlotModel;
            isAvailable: boolean;
        }> = [];

        for (let i = 0; i < totalDays; i++) {
            const currentDate = addDays(availability.start_date, i);
            const normalizedDate = startOfDay(currentDate);

            // Trouver le slot qui couvre cette date
            const slot = availability.slots?.find(s => {
                const slotStart = startOfDay(s.start_date);
                const slotEnd = startOfDay(s.end_date);
                return normalizedDate >= slotStart && normalizedDate <= slotEnd;
            });

            timeline.push({
                date: currentDate,
                dayIndex: i,
                slot,
                isAvailable: !slot || slot.status === ItemAvailabilitySlotStatus.AVAILABLE
            });
        }

        return timeline;
    };

    const timeline = generateTimeline();

    const getSlotColor = (slot?: ItemAvailabilitySlotModel) => {
        if (!slot) return 'bg-green-200 hover:bg-green-300'; // Libre
        
        switch (slot.status) {
            case ItemAvailabilitySlotStatus.AVAILABLE:
                return 'bg-green-200 hover:bg-green-300'; // Libre
            case ItemAvailabilitySlotStatus.RESERVED:
                return 'bg-orange-200 hover:bg-orange-300'; // Réservé
            case ItemAvailabilitySlotStatus.OCCUPIED:
                return 'bg-red-200 hover:bg-red-300'; // Occupé
            default:
                return 'bg-gray-200 hover:bg-gray-300';
        }
    };

    const getSlotLabel = (slot?: ItemAvailabilitySlotModel) => {
        if (!slot) return 'Libre';
        
        switch (slot.status) {
            case ItemAvailabilitySlotStatus.AVAILABLE:
                return 'Libre';
            case ItemAvailabilitySlotStatus.RESERVED:
                return 'Réservé';
            case ItemAvailabilitySlotStatus.OCCUPIED:
                return 'Occupé';
            default:
                return 'Inconnu';
        }
    };

    const getTooltipContent = (item: typeof timeline[0]) => {
        const dateStr = format(item.date, 'dd MMM yyyy', { locale: fr });
        
        if (!item.slot) {
            return `${dateStr} - Libre`;
        }

        const slotRange = formatDateRange(item.slot.start_date, item.slot.end_date);
        const status = getSlotLabel(item.slot);
        
        return `${dateStr} - ${status}\nPériode: ${slotRange}`;
    };

    return (
        <TooltipProvider>
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <span className="material-symbols-outlined">timeline</span>
                            Calendrier de disponibilité
                        </CardTitle>
                        {canManage && (
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => onModifyAvailability?.(availability.id)}
                            >
                                <span className="material-symbols-outlined text-sm mr-2">edit</span>
                                Modifier
                            </Button>
                        )}
                    </div>
                    <div className="text-sm text-gray-600">
                        {formatDateRange(availability.start_date, availability.end_date)} • {totalDays} jour(s)
                    </div>
                </CardHeader>
                
                <CardContent>
                    {/* Légende */}
                    <div className="flex flex-wrap gap-4 mb-4 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-200 rounded"></div>
                            <span>Libre</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-orange-200 rounded"></div>
                            <span>Réservé</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-200 rounded"></div>
                            <span>Occupé</span>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-2">
                        {/* En-têtes des jours de la semaine */}
                        <div className="grid grid-cols-7 gap-1 text-xs text-center text-gray-500 mb-2">
                            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                                <div key={index} className="py-1">{day}</div>
                            ))}
                        </div>

                        {/* Grille des jours */}
                        <div className="grid grid-cols-7 gap-1">
                            {timeline.map((item) => (
                                <Tooltip key={item.dayIndex}>
                                    <TooltipTrigger asChild>
                                        <button
                                            className={`
                                                aspect-square rounded text-xs font-medium border transition-colors
                                                ${getSlotColor(item.slot)}
                                                ${item.slot && canManage ? 'cursor-pointer' : 'cursor-default'}
                                                border-gray-300
                                            `}
                                            onClick={() => item.slot && setSelectedSlot(item.slot)}
                                        >
                                            {format(item.date, 'd')}
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <div className="whitespace-pre-line">
                                            {getTooltipContent(item)}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                    </div>

                    {/* Statistiques */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-3 gap-4 text-center text-sm">
                            <div>
                                <div className="font-semibold text-green-600">
                                    {availableSlots.reduce((sum, slot) => sum + slot.duration_days, 0)}
                                </div>
                                <div className="text-gray-600">Jours libres</div>
                            </div>
                            <div>
                                <div className="font-semibold text-orange-600">
                                    {availability.slots?.filter(s => s.status === ItemAvailabilitySlotStatus.RESERVED).length || 0}
                                </div>
                                <div className="text-gray-600">Réservations</div>
                            </div>
                            <div>
                                <div className="font-semibold text-red-600">
                                    {availability.slots?.filter(s => s.status === ItemAvailabilitySlotStatus.OCCUPIED).length || 0}
                                </div>
                                <div className="text-gray-600">En cours</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog de détails du slot */}
            {selectedSlot && (
                <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Détails de la réservation</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Période :</span>
                                <span>{formatDateRange(selectedSlot.start_date, selectedSlot.end_date)}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Statut :</span>
                                <Badge 
                                    hover={false}
                                    variant={selectedSlot.status === ItemAvailabilitySlotStatus.RESERVED ? 'secondary' : 'destructive'}
                                >
                                    {getSlotLabel(selectedSlot)}
                                </Badge>
                            </div>

                            {selectedSlot.status === ItemAvailabilitySlotStatus.RESERVED && canManage && (
                                <div className="pt-4 border-t">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                            onCancelReservation?.(selectedSlot.id);
                                            setSelectedSlot(null);
                                        }}
                                        className="w-full"
                                    >
                                        <span className="material-symbols-outlined text-sm mr-2">cancel</span>
                                        Annuler cette réservation
                                    </Button>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </TooltipProvider>
    );
}