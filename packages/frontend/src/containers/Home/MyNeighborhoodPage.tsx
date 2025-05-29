import { UserModel } from '@/domain/models/user.model.ts';
import { EventModel } from '@/domain/models/event.model.ts';
import { useEffect, useState } from 'react';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import PreviewEvent from '@/components/PreviewEvent/PreviewEvent.tsx';
import NotCreatedEvent from '@/components/PreviewEvent/NotCreatedEvent.tsx';

export default function MyNeighborhoodPage({
    user,
    neighborhoodId,
    uc,
}: {
    user: UserModel | null;
    neighborhoodId: number;
    uc: HomeUc;
}) {
    const [events, setEvents] = useState<EventModel[]>([]);

    useEffect(() => {
        const fetchEvents = async () => {
            const events = await uc.getNeighborhoodEvents(neighborhoodId, 3, 1);
            setEvents(events);
        };
        fetchEvents();
    }, []);

    if (!user || neighborhoodId === -1) {
        return (
            <>
                <p>Chargement...</p>
            </>
        );
    }

    return (
        <div>
            <div className="px-32 pt-8 w-full bg-white flex flex-row border-t-8 border-black gap-4 h-[234px]">
                {user.profileImageUrl ? (
                    <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
                        <img
                            src={user.profileImageUrl ?? undefined}
                            alt="User Profile"
                            className="w-14 h-14 rounded-full"
                        />
                    </div>
                ) : (
                    <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-gray-700">person</span>
                    </div>
                )}
                <div>
                    <p className={'font-bold text-xl'}>
                        <span className={'text-orange'}>Bonjour</span> {user.firstName},
                    </p>
                    <p className={'text-sm'}>Quoi de neuf ?</p>
                </div>
            </div>
            <div className={'px-32 relative -mt-24'}>
                <div className={'flex items-center gap-2'}>
                    <p>Prochains évènements</p>
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                    {events.length > 0 ? (
                        events.map((event: EventModel) => <PreviewEvent key={event.id} event={event} user={user} />)
                    ) : (
                        <NotCreatedEvent />
                    )}
                </div>
            </div>
        </div>
    );
}
