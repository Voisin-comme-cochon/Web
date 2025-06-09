import { useEffect, useState } from 'react';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { UserModel } from '@/domain/models/user.model.ts';
import PreviewEvent from '@/components/PreviewEvent/PreviewEvent.tsx';
import { EventModel } from '@/domain/models/event.model.ts';

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

    if (!events || events.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-lg">Aucun événement prévu.</p>
            </div>
        );
    }

    return (
        <div className="px-32 mb-8 w-full">
            <h1 className="text-2xl font-semibold mb-4">Événements à venir</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {events.map((event) => (
                    <PreviewEvent key={event.id} event={event} user={user} />
                ))}
            </div>
        </div>
    );
}
