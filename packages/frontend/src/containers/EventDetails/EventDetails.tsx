import { useParams } from 'react-router-dom';
import { EventModelWithUser } from '@/domain/models/event.model.ts';
import { useEffect, useState } from 'react';
import { withHeaderData } from '@/containers/Wrapper/Wrapper.tsx';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import './style.css';
import DashboardHeader from '@/components/Header/DashboardHeader.tsx';
import UserCard from '@/components/UserCard/UserCard.tsx';
import EventMapBox from '@/components/MapBox/EventMapBox.tsx';
import { MapBoxRepository } from '@/infrastructure/repositories/MapBoxRepository.ts';
import { Button } from '@/components/ui/button.tsx';
import { UserModel } from '@/domain/models/user.model.ts';
import { useToast } from '@/presentation/hooks/useToast.ts';

type ChangeCategory = 'description' | 'inscrits' | 'lieu';

function EventDetails({ user, uc }: { user: UserModel; uc: HomeUc }) {
    const [event, setEvent] = useState<EventModelWithUser | null>(null);
    const [addressStart, setAddressStart] = useState<string | null>(null);
    const [addressEnd, setAddressEnd] = useState<string | null>(null);
    const [isRegistered, setIsRegistered] = useState<boolean>(false);
    const { eventId } = useParams<{ eventId: string }>();
    const [selectedCategory, setSelectedCategory] = useState<ChangeCategory>('description');
    const { showError, showSuccess } = useToast();

    useEffect(() => {
        const checkRegistration = async () => {
            if (!eventId) return;
            try {
                const idNum = parseInt(eventId, 10);
                const registered = await uc.isUserRegistered(idNum, user.id);
                setIsRegistered(registered);
            } catch (error) {
                console.error('Failed to check registration:', error);
            }
        };
        checkRegistration();
    }, [eventId, uc]);

    const handleCategoryChange = (category: ChangeCategory) => {
        setSelectedCategory(category);
    };

    useEffect(() => {
        const fetchEvent = async () => {
            if (!eventId) return;
            try {
                const idNum = parseInt(eventId, 10);
                const fetchedEvent = await uc.getEventById(idNum);
                setEvent(fetchedEvent);
            } catch (error) {
                console.error('Failed to fetch event:', error);
            }
        };
        fetchEvent();
    }, [eventId, uc, isRegistered]);

    useEffect(() => {
        if (!event) return;

        const fetchAddress = async () => {
            const mapBoxRepo = new MapBoxRepository();

            if (event.addressStart?.coordinates) {
                try {
                    const addrStart = await mapBoxRepo.getAddressByPoint(event.addressStart.coordinates);
                    setAddressStart(addrStart);
                } catch (err) {
                    console.error('Erreur lors de la récupération de l’adresse de départ :', err);
                }
            }

            if (event.addressEnd?.coordinates) {
                try {
                    const addrEnd = await mapBoxRepo.getAddressByPoint(event.addressEnd.coordinates);
                    setAddressEnd(addrEnd);
                } catch (err) {
                    console.error('Erreur lors de la récupération de l’adresse d’arrivée :', err);
                }
            }
        };

        fetchAddress();
    }, [event]);

    const registerEvent = async () => {
        if (!eventId) return;
        try {
            const idNum = parseInt(eventId, 10);
            await uc.registerToEvent(idNum);
            setIsRegistered(true);
            showSuccess('Inscription réussie !');
        } catch (error) {
            if (error instanceof Error) {
                showError(error.message);
                return;
            }
            console.error('Failed to register for event:', error);
        }
    };

    const unRegisterEvent = async () => {
        if (!eventId) return;
        try {
            const idNum = parseInt(eventId, 10);
            await uc.unRegisterFromEvent(idNum);
            setIsRegistered(false);
            showSuccess('Désinscription réussie !');
        } catch (error) {
            console.error('Failed to register for event:', error);
        }
    };

    if (!event) {
        return <div className="flex items-center justify-center h-screen">Chargement de l’évènement…</div>;
    }

    return (
        <>
            <DashboardHeader />
            <div className="page">
                <div className="popup">
                    <div className="popup-header">
                        <p className="popup-title">{event.name}</p>
                        <span className="material-symbols-outlined popup-close">close</span>
                    </div>

                    <p>
                        {new Date(event.dateStart).toLocaleDateString()} -{' '}
                        {new Date(event.dateEnd).toLocaleDateString()}
                    </p>

                    <div className="img-popup-container">
                        <img src={event.photo} alt="Photo de l’évènement" className="img-popup" />
                    </div>

                    <div className="popup-content">
                        <div className="popup-content-category">
                            <p
                                onClick={() => handleCategoryChange('description')}
                                className={selectedCategory === 'description' ? 'focus-category' : undefined}
                            >
                                Description
                            </p>
                            <p
                                onClick={() => handleCategoryChange('inscrits')}
                                className={selectedCategory === 'inscrits' ? 'focus-category' : undefined}
                            >
                                Inscrits
                            </p>
                            <p
                                onClick={() => handleCategoryChange('lieu')}
                                className={selectedCategory === 'lieu' ? 'focus-category' : undefined}
                            >
                                Lieu
                            </p>
                        </div>

                        <div className="popup-content-description">
                            {selectedCategory === 'description' && (
                                <div>
                                    <p>{event.description}</p>
                                </div>
                            )}

                            {selectedCategory === 'inscrits' && (
                                <div className="registered-list">
                                    <p className="registered-amount">
                                        {event.registeredUsers.length} / {event.max}
                                    </p>
                                    <div className="registered-grid">
                                        {event.registeredUsers.map((participant) => (
                                            <UserCard
                                                uc={uc}
                                                key={participant.id}
                                                user={participant}
                                                isCreator={participant.id === event.creator.id}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedCategory === 'lieu' &&
                                (addressStart ? (
                                    <div>
                                        <p>{addressStart}</p>
                                        <p>{addressEnd ? ` → ${addressEnd}` : ''}</p>
                                        <EventMapBox
                                            start={event.addressStart?.coordinates ?? null}
                                            end={event.addressEnd?.coordinates}
                                        />
                                    </div>
                                ) : (
                                    <p>Pas de lieu renseigné</p>
                                ))}
                        </div>
                    </div>

                    <div className="popup-action">
                        {isRegistered ? (
                            <Button variant={'destructive'} className={'w-full'} onClick={unRegisterEvent}>
                                Se désinscrire
                            </Button>
                        ) : (
                            <Button variant={'orange'} className={'w-full'} onClick={registerEvent}>
                                S'inscrire
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default withHeaderData(EventDetails);
