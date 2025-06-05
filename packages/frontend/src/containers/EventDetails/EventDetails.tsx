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

type ChangeCategory = 'description' | 'inscrits' | 'lieu';

function EventDetails({ uc }: { uc: HomeUc }) {
    const [event, setEvent] = useState<EventModelWithUser | null>(null);
    const [addressStart, setAddressStart] = useState<string | null>(null);
    const [addressEnd, setAddressEnd] = useState<string | null>(null);
    const { eventId } = useParams<{ eventId: string }>();
    const [selectedCategory, setSelectedCategory] = useState<ChangeCategory>('description');

    const handleCategoryChange = (category: ChangeCategory) => {
        setSelectedCategory(category);
    };

    // 1) Récupère l'évènement au chargement (ou quand eventId change)
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
    }, [eventId, uc]);

    // 2) Une fois que "event" est récupéré (non null), on appelle MapBox pour obtenir les adresses
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

    // Affiche un loader tant que l'évènement n'est pas chargé
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

                    <div className="popup-action">{/* Action buttons si nécessaire */}</div>
                </div>
            </div>
        </>
    );
}

export default withHeaderData(EventDetails);
