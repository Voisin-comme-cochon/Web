import { useParams } from 'react-router-dom';
import { FC, useEffect, useState } from 'react';
import { withHeaderData } from '@/containers/Wrapper/Wrapper.tsx';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import DashboardHeader from '@/components/Header/DashboardHeader.tsx';
import UserCard from '@/components/UserCard/UserCard.tsx';
import EventMapBox from '@/components/MapBox/EventMapBox.tsx';
import { MapBoxRepository } from '@/infrastructure/repositories/MapBoxRepository.ts';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useToast } from '@/presentation/hooks/useToast.ts';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Trash, X } from 'lucide-react';
import type { EventModelWithUser } from '@/domain/models/event.model.ts';
import type { UserModel } from '@/domain/models/user.model.ts';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx';

type ChangeCategory = 'description' | 'inscrits' | 'lieu';

const EventDetails: FC<{ user: UserModel; uc: HomeUc }> = ({ user, uc }) => {
    const { eventId } = useParams<{ eventId: string }>();
    const [event, setEvent] = useState<EventModelWithUser | null>(null);
    const [addressStart, setAddressStart] = useState<string | null>(null);
    const [addressEnd, setAddressEnd] = useState<string | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<ChangeCategory>('description');
    const [popUpVisible, setPopUpVisible] = useState(false);
    const [reason, setReason] = useState('');
    const { showError, showSuccess } = useToast();

    useEffect(() => {
        if (!eventId) return;
        uc.getEventById(+eventId).then(setEvent).catch(console.error);
    }, [eventId, uc, isRegistered]);

    useEffect(() => {
        if (!event) return;
        const repo = new MapBoxRepository();
        if (event.addressStart?.coordinates) {
            repo.getAddressByPoint(event.addressStart.coordinates).then(setAddressStart).catch(console.error);
        }
        if (event.addressEnd?.coordinates) {
            repo.getAddressByPoint(event.addressEnd.coordinates).then(setAddressEnd).catch(console.error);
        }
    }, [event]);

    useEffect(() => {
        if (!eventId) return;
        uc.isUserRegistered(+eventId, user.id).then(setIsRegistered).catch(console.error);
    }, [eventId, uc, user.id]);

    const handleDeleteEvent = async () => {
        if (!eventId) return;
        try {
            await uc.deleteEvent(+eventId, reason);
            showSuccess('Évènement supprimé avec succès !');
            window.history.back();
        } catch (err) {
            showError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
        }
    };

    const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReason(e.target.value);
    };

    const registerEvent = async () => {
        if (!eventId) return;
        try {
            await uc.registerToEvent(+eventId);
            setIsRegistered(true);
            showSuccess('Inscription réussie !');
        } catch (err) {
            showError(err instanceof Error ? err.message : 'Erreur inscrption');
        }
    };

    const unRegisterEvent = async () => {
        if (!eventId) return;
        try {
            await uc.unRegisterFromEvent(+eventId);
            setIsRegistered(false);
            showSuccess('Désinscription réussie !');
        } catch (err) {
            console.error(err);
        }
    };

    if (!event) return <div className="flex items-center justify-center h-screen">Chargement…</div>;

    return (
        <>
            <DashboardHeader />
            <Dialog open={popUpVisible} onOpenChange={setPopUpVisible}>
                <DialogContent className="sm:max-w-md w-full p-6 bg-white rounded-2xl shadow-lg">
                    <DialogClose></DialogClose>
                    <DialogHeader className="space-y-1 text-center">
                        <DialogTitle className="text-xl font-semibold text-orange">
                            Supprimer cet événement ?
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-600">
                            Les personnes déjà inscrites seront prévenues de l'annulation.
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        placeholder="Message à adresser aux gens"
                        className="w-full mt-4"
                        onChange={handleReasonChange}
                    />
                    <DialogFooter className="mt-6 grid grid-cols-2 gap-2">
                        <Button variant="outline" className="w-full" onClick={() => setPopUpVisible(false)}>
                            Fermer
                        </Button>
                        <Button variant="destructive" className="w-full" onClick={handleDeleteEvent}>
                            Annuler l'événement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card className="max-w-3xl mx-auto mt-8">
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="text-2xl">{event.name}</CardTitle>
                    <Button variant="ghost" onClick={() => window.history.back()}>
                        <X />
                    </Button>
                </CardHeader>

                {new Date(event.dateStart).toLocaleDateString() === new Date(event.dateEnd).toLocaleDateString() ? (
                    <p className="px-6">
                        Le {new Date(event.dateStart).toLocaleDateString()} de{' '}
                        {new Date(event.dateStart).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}{' '}
                        à{' '}
                        {new Date(event.dateEnd).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </p>
                ) : (
                    <p className="px-6">
                        du {new Date(event.dateStart).toLocaleDateString()} à{' '}
                        {new Date(event.dateStart).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}{' '}
                        au {new Date(event.dateEnd).toLocaleDateString()} à{' '}
                        {new Date(event.dateEnd).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </p>
                )}

                <CardContent className="px-6">
                    <img
                        src={event.photo}
                        alt="Photo de l’évènement"
                        className="w-full h-64 object-cover rounded-lg mb-4"
                    />

                    <div className="flex space-x-4 mb-4">
                        {(['description', 'inscrits', 'lieu'] as ChangeCategory[]).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full font-medium hover:bg-gray-100 ${
                                    selectedCategory === cat ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                                }`}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="mb-4">
                        {selectedCategory === 'description' && <p className="text-gray-700">{event.description}</p>}
                        {selectedCategory === 'inscrits' && (
                            <>
                                <p className="text-sm text-gray-500 mb-2">
                                    {event.registeredUsers.length} / {event.max}
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {event.registeredUsers.map((u) => (
                                        <UserCard key={u.id} user={u} uc={uc} isCreator={u.id === event.creator.id} />
                                    ))}
                                </div>
                            </>
                        )}
                        {selectedCategory === 'lieu' &&
                            (addressStart ? (
                                <>
                                    <p className="text-gray-700">Départ : {addressStart}</p>
                                    {addressEnd && <p className="text-gray-700">Arrivée : {addressEnd}</p>}
                                    <p>--</p>
                                    <EventMapBox
                                        start={event.addressStart?.coordinates ?? null}
                                        end={event.addressEnd?.coordinates}
                                    />
                                </>
                            ) : (
                                <p className="text-gray-500">Pas de lieu renseigné</p>
                            ))}
                    </div>
                </CardContent>

                <CardFooter className="flex space-x-2 px-6">
                    {isRegistered ? (
                        <Button variant="destructive" onClick={unRegisterEvent} disabled={event.creator.id === user.id}>
                            Se désinscrire
                        </Button>
                    ) : (
                        <Button variant="default" onClick={registerEvent}>
                            S'inscrire
                        </Button>
                    )}
                    {user.id === event.creator.id && (
                        <Button variant="destructive" onClick={() => setPopUpVisible(true)}>
                            <Trash />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </>
    );
};

export default withHeaderData(EventDetails);
