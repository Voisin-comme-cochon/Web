import { useParams } from 'react-router-dom';
import { EventModelWithUser } from '@/domain/models/event.model.ts';
import { useEffect, useState } from 'react';
import { withHeaderData } from '@/containers/Wrapper/Wrapper.tsx';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import './style.css';
import DashboardHeader from '@/components/Header/DashboardHeader.tsx';

type changeCategory = 'description' | 'inscrits' | 'lieu';

function EventDetails({ uc }: { uc: HomeUc }) {
    const [event, setEvent] = useState<EventModelWithUser | null>(null);
    const { eventId } = useParams<{ eventId: string }>();
    const [selectedCategory, setSelectedCategory] = useState<changeCategory>('description');

    const handleCategoryChange = (category: changeCategory) => {
        setSelectedCategory(category);
    };

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const eventIdNumber = parseInt(eventId || '0', 10);
                const event = await uc.getEventById(eventIdNumber);
                setEvent(event);
            } catch (error) {
                console.error('Failed to fetch event:', error);
            }
        };

        fetchEvent();
    }, []);

    if (!event) {
        return <div className="flex items-center justify-center h-screen">Chargement de l'évènement...</div>;
    }
    return (
        <>
            <DashboardHeader />
            <div className={'page'}>
                <div className={'popup'}>
                    <div className={'popup-header'}>
                        <p className={'popup-title'}>{event?.name}</p>
                        <span className={'material-symbols-outlined popup-close'}>close</span>
                    </div>
                    <p>
                        {new Date(event?.dateStart).toLocaleDateString()} -{' '}
                        {new Date(event?.dateEnd).toLocaleDateString()}
                    </p>
                    <div className={'img-popup-container'}>
                        <img src={event?.photo} alt={"Photo de l'évènement"} className={'img-popup'} />
                    </div>
                    <div className={'popup-content'}>
                        <div className={'popup-content-category'}>
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
                        <div className={'popup-content-description'}>
                            {selectedCategory === 'description' && (
                                <div>
                                    <p>{event?.description}</p>
                                </div>
                            )}
                            {selectedCategory === 'inscrits' && (
                                <div>
                                    <p>Nombre d'inscrits : {event?.registeredUsers.length}</p>
                                    <ul>
                                        {event?.registeredUsers.map((participant) => (
                                            <li key={participant.id}>{participant.firstName}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {selectedCategory === 'lieu' && (
                                <div>
                                    <p>{event?.addressEnd?.type}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={'popup-action'}></div>
                </div>
            </div>
        </>
    );
}

export default withHeaderData(EventDetails);
