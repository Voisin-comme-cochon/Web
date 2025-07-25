import { useEffect, useState } from 'react';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import PreviewEvent from '@/components/PreviewEvent/PreviewEvent.tsx';
import { EventModel } from '@/domain/models/event.model.ts';
import MultiSelectTagComponent from '@/components/SelectComponent/MultiSelectTagComponent.tsx';
import { TagModel } from '@/domain/models/tag.model.ts';
import { Button } from '@/components/ui/button.tsx';
import { useAppNavigation } from '@/presentation/state/navigate.ts';
import { cn } from '@/lib/utils';

export default function MyEventsPage({ uc, neighborhoodId }: { uc: HomeUc; neighborhoodId: string }) {
    const [events, setEvents] = useState<EventModel[]>([]);
    const [tagFilter, setTagFilter] = useState<string[]>([]);
    const [tags, setTags] = useState<TagModel[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<EventModel[]>([]);
    const [typeFilter, setTypeFilter] = useState<'all' | 'event' | 'service'>('all');
    const { goCreateEvent } = useAppNavigation();

    const onTagSelect = (tagIds: string[]) => {
        setTagFilter(tagIds);
    };

    useEffect(() => {
        const fetchTags = async () => {
            const tags = await uc.getTags();
            setTags(tags);
        };
        fetchTags();
    }, []);

    useEffect(() => {
        let filtered = events;
        if (typeFilter !== 'all') {
            filtered = filtered.filter((event) => event.type === typeFilter);
        }
        if (tagFilter.length > 0) {
            filtered = filtered.filter((event) => tagFilter.includes(event.tag.name));
        }
        setFilteredEvents(filtered);
    }, [tagFilter, events, typeFilter]);

    useEffect(() => {
        if (!neighborhoodId || !uc) return;

        const fetchEvents = async () => {
            try {
                const data = await uc.getNeighborhoodEvents(Number(neighborhoodId), 2000, 1);
                setEvents(data);
            } catch (err) {
                console.error('Error fetching events:', err);
            }
        };

        fetchEvents();
    }, [neighborhoodId, uc]);

    return (
        <div className="px-32 mb-8 w-full">
            <div className={'flex flex-row justify-between items-center mb-1'}>
                <div className={'flex flex-row gap-2 items-center'}>
                    <MultiSelectTagComponent tags={tags} onSelect={onTagSelect} />
                    <div className="flex gap-2">
                        <button
                            className={cn(
                                'px-3 py-1 rounded-full border',
                                typeFilter === 'all' ? 'bg-orange text-white' : 'bg-white text-gray-700 border-gray-300'
                            )}
                            onClick={() => setTypeFilter('all')}
                        >
                            Tous
                        </button>
                        <button
                            className={cn(
                                'px-3 py-1 rounded-full border',
                                typeFilter === 'event'
                                    ? 'bg-orange text-white'
                                    : 'bg-white text-gray-700 border-gray-300'
                            )}
                            onClick={() => setTypeFilter('event')}
                        >
                            Évènements
                        </button>
                        <button
                            className={cn(
                                'px-3 py-1 rounded-full border',
                                typeFilter === 'service'
                                    ? 'bg-orange text-white'
                                    : 'bg-white text-gray-700 border-gray-300'
                            )}
                            onClick={() => setTypeFilter('service')}
                        >
                            Services
                        </button>
                    </div>
                </div>
                <Button variant={'orange'} onClick={goCreateEvent}>
                    Créer un évènement
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredEvents.map((event) => (
                    <PreviewEvent key={event.id} event={event} />
                ))}
            </div>
        </div>
    );
}
