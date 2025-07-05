import { useState } from 'react';
import { ItemModel, ItemAvailabilityModel, CreateItemAvailabilityRequest } from '@/domain/models/item.model';
import { useItemAvailabilities } from '@/presentation/hooks/useItems';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ItemAvailabilityStatus } from '@/domain/models/item.model';

interface AvailabilityManagerProps {
    item: ItemModel;
    currentUserId: number;
}

export default function AvailabilityManager({ item, currentUserId }: AvailabilityManagerProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const { availabilities, loading, error, createAvailability, deleteAvailability, refetch } = useItemAvailabilities(
        item.id
    );

    const isOwner = item.owner_id === currentUserId;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!startDate || !endDate) {
            return;
        }

        const request: CreateItemAvailabilityRequest = {
            item_id: item.id,
            start_date: new Date(startDate),
            end_date: new Date(endDate),
        };

        const success = await createAvailability(request);
        if (success) {
            setStartDate('');
            setEndDate('');
            setShowAddForm(false);
        }
    };

    const handleDelete = async (availabilityId: number) => {
        const success = await deleteAvailability(availabilityId);
        if (success) {
            refetch();
        }
    };

    const getStatusInfo = (availability: ItemAvailabilityModel) => {
        const now = new Date();
        const start = new Date(availability.start_date);
        const end = new Date(availability.end_date);

        if (end < now) {
            return { label: 'Passé', color: 'bg-gray-100 text-gray-800' };
        } else if (start > now) {
            return { label: 'À venir', color: 'bg-blue-100 text-blue-800' };
        } else {
            switch (availability.status) {
                case ItemAvailabilityStatus.AVAILABLE:
                    return { label: 'Libre maintenant', color: 'bg-green-100 text-green-800' };
                case ItemAvailabilityStatus.OCCUPIED:
                    return { label: 'Occupé', color: 'bg-red-100 text-red-800' };
                case ItemAvailabilityStatus.PARTIALLY_AVAILABLE:
                    return { label: 'Partiellement libre', color: 'bg-yellow-100 text-yellow-800' };
                default:
                    return { label: 'Actuel', color: 'bg-blue-100 text-blue-800' };
            }
        }
    };

    const getTomorrowDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const getMinEndDate = () => {
        if (!startDate) return getTomorrowDate();
        const start = new Date(startDate);
        start.setDate(start.getDate() + 1);
        return start.toISOString().split('T')[0];
    };

    if (!isOwner) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="material-symbols-outlined">calendar_today</span>
                        Disponibilités
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {availabilities.length > 0 ? (
                        <div className="space-y-3">
                            {availabilities.map((availability) => {
                                const { label, color } = getStatusInfo(availability);
                                return (
                                    <div
                                        key={availability.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="font-medium">
                                                    Du{' '}
                                                    {format(new Date(availability.start_date), 'dd MMM', {
                                                        locale: fr,
                                                    })}{' '}
                                                    au{' '}
                                                    {format(new Date(availability.end_date), 'dd MMM yyyy', {
                                                        locale: fr,
                                                    })}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {Math.ceil(
                                                        (new Date(availability.end_date).getTime() -
                                                            new Date(availability.start_date).getTime()) /
                                                            (1000 * 60 * 60 * 24)
                                                    )}{' '}
                                                    jour(s)
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className={color} hover={false}>{label}</Badge>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl text-gray-400">calendar_month</span>
                            </div>
                            <p className="text-gray-600">Aucune disponibilité définie</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <span className="material-symbols-outlined">calendar_today</span>
                        Mes disponibilités
                    </CardTitle>
                    <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                        <DialogTrigger asChild>
                            <Button variant="orange" size="sm">
                                <span className="material-symbols-outlined text-sm mr-2">add</span>
                                Ajouter
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Ajouter une disponibilité</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="start_date">Date de début</Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            min={getTomorrowDate()}
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end_date">Date de fin</Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            min={getMinEndDate()}
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <Alert>
                                    <span className="material-symbols-outlined text-sm">info</span>
                                    <AlertDescription>
                                        Définissez les périodes pendant lesquelles votre objet sera disponible à
                                        l'emprunt.
                                    </AlertDescription>
                                </Alert>

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowAddForm(false)}
                                        className="flex-1"
                                    >
                                        Annuler
                                    </Button>
                                    <Button type="submit" disabled={loading} className="flex-1">
                                        {loading ? (
                                            <>
                                                <span className="material-symbols-outlined animate-spin text-sm mr-2">
                                                    refresh
                                                </span>
                                                Ajout...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-sm mr-2">add</span>
                                                Ajouter
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {availabilities.length > 0 ? (
                    <div className="space-y-3">
                        {availabilities.map((availability) => {
                            const { label, color } = getStatusInfo(availability);
                            const isPast = new Date(availability.end_date) < new Date();

                            return (
                                <div
                                    key={availability.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="font-medium">
                                                Du {format(new Date(availability.start_date), 'dd MMM', { locale: fr })}{' '}
                                                au{' '}
                                                {format(new Date(availability.end_date), 'dd MMM yyyy', { locale: fr })}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {Math.ceil(
                                                    (new Date(availability.end_date).getTime() -
                                                        new Date(availability.start_date).getTime()) /
                                                        (1000 * 60 * 60 * 24)
                                                )}{' '}
                                                jour(s)
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={color} hover={false}>{label}</Badge>
                                        {!isPast && availability.status === ItemAvailabilityStatus.AVAILABLE && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(availability.id)}
                                                disabled={loading}
                                            >
                                                <span className="material-symbols-outlined text-sm text-red-600">
                                                    delete
                                                </span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl text-gray-400">calendar_month</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Aucune disponibilité</h3>
                        <p className="text-gray-600 mb-4">
                            Ajoutez des créneaux pour que vos voisins puissent emprunter votre objet.
                        </p>
                    </div>
                )}

                <Alert className="mt-4">
                    <span className="material-symbols-outlined text-sm">lightbulb</span>
                    <AlertDescription>
                        <strong>Comment ça marche :</strong> Les disponibilités définissent quand votre objet peut être
                        emprunté. Quand quelqu'un fait une demande, le créneau devient "occupé" si vous acceptez.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
}
