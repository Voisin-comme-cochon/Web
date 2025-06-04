import { useParams } from 'react-router-dom';
import { EventModel } from '@/domain/models/event.model.ts';
import { useEffect, useState } from 'react';
import { withHeaderData } from '@/containers/Wrapper/Wrapper.tsx';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';

type changeCategory = 'description' | 'inscrits' | 'lieu';

function EventDetails({ uc }: { uc: HomeUc }) {
    const [event, setEvent] = useState<EventModel | null>(null);
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

    return (
        <div className={'popup'}>
            <div className={'popup-header'}>
                <p>{event?.name}</p>
                <span className={'material-symbols-outlined'}>close</span>
            </div>
            <div>
                <img src={event?.photo} alt={"Photo de l'évènement"} />
            </div>
            <div className={'popup-content'}>
                <div className={'popup-content-category'}>
                    <p onClick={() => handleCategoryChange('description')}>Description</p>
                    <p onClick={() => handleCategoryChange('inscrits')}>Inscrits</p>
                    <p onClick={() => handleCategoryChange('lieu')}>Lieu</p>
                </div>
                <div className={'popup-content-description'}>
                    {selectedCategory === 'description' && (
                        <div>
                            <h3>Description</h3>
                            <p>{event?.description}</p>
                        </div>
                    )}
                    {selectedCategory === 'inscrits' && (
                        <div>
                            <h3>Inscrits</h3>
                            <p>Nombre d'inscrits : {event?.registeredUsers}</p>
                            <ul>
                                {event?.registeredUsers.map((participant) => (
                                    <li key={participant.id}>{participant.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {selectedCategory === 'lieu' && (
                        <div>
                            <h3>Lieu</h3>
                            <p>{event?.location}</p>
                        </div>
                    )}
                </div>
            </div>
            <div className={'popup-action'}></div>
        </div>
    );
}

export default withHeaderData(EventDetails);
