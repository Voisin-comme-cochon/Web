import { useEffect, useState } from 'react';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { UserModel } from '@/domain/models/user.model.ts';
import PreviewEvent from '@/components/PreviewEvent/PreviewEvent.tsx';
import { EventModel } from '@/domain/models/event.model.ts';
import MultiSelectTagComponent from '@/components/SelectComponent/MultiSelectTagComponent.tsx';
import { TagModel } from '@/domain/models/tag.model.ts';

export default function MyEventsPage({
    uc,
    neighborhoodId,
    user,
}: {
    uc: HomeUc;
    neighborhoodId: string;
    user: UserModel;
}) {
    const [events, setEvents] = useState<EventModel[]>([]);
    const [tagFilter, setTagFilter] = useState<string[]>([]);
    const [tags, setTags] = useState<TagModel[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<EventModel[]>([]);

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
        if (tagFilter.length === 0) {
            setFilteredEvents(events);
        } else {
            const filtered = events.filter((event) => tagFilter.includes(event.tag.name));
            setFilteredEvents(filtered);
        }
    }, [tagFilter, events]);

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
                <MultiSelectTagComponent tags={tags} onSelect={onTagSelect} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredEvents.map((event) => (
                    <PreviewEvent key={event.id} event={event} user={user} />
                ))}
            </div>
        </div>
    );
}
