import { EventModel } from '@/domain/models/event.model.ts';
import { useEffect, useState } from 'react';
import PreviewEvent from '@/components/PreviewEvent/PreviewEvent.tsx';
import NotCreatedEvent from '@/components/PreviewEvent/NotCreatedEvent.tsx';
import { useAppNavigation } from '@/presentation/state/navigate.ts';
import { UserModel } from '@/domain/models/user.model.ts';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import DashboardHeader from '@/components/Header/DashboardHeader.tsx';
import { withNeighborhoodLayoutUserCheck } from '@/containers/Wrapper/NeighborhoodWrapper';

function MyNeighborhoodPage({ user, uc }: { user: UserModel | null; uc: HomeUc }) {
    const [events, setEvents] = useState<EventModel[]>([]);
    const { goNeighborhoodEvents } = useAppNavigation();
    const neighborhoodId = localStorage.getItem('neighborhoodId');

    useEffect(() => {
        const fetchEvents = async () => {
            if (neighborhoodId) {
                const events = await uc.getNeighborhoodEvents(Number(neighborhoodId), 3, 1);
                setEvents(events);
            }
        };
        fetchEvents();
    }, [neighborhoodId, uc]);

    if (!user || !neighborhoodId) {
        return (
            <>
                <DashboardHeader />
                <div className="flex items-center justify-center h-[calc(100vh-64px)] flex-col">
                    <p className="text-lg">Veuillez sélectionner un quartier pour continuer.</p>
                </div>
            </>
        );
    }

    return (
        <div>
            <DashboardHeader />
            <div className="px-32 pt-8 w-full bg-white flex flex-row gap-4 h-[234px]">
                {user.profileImageUrl ? (
                    <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
                        <img
                            src={user.profileImageUrl ?? undefined}
                            alt="User Profile"
                            className="w-14 h-14 rounded-full object-cover"
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
                <div className={'flex items-center gap-2 cursor-pointer'} onClick={goNeighborhoodEvents}>
                    <p>Prochains évènements</p>
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                    {events.length > 0 ? (
                        events.map((event: EventModel) => <PreviewEvent key={event.id} event={event} />)
                    ) : (
                        <NotCreatedEvent />
                    )}
                </div>
            </div>
        </div>
    );
}

export default withNeighborhoodLayoutUserCheck(MyNeighborhoodPage);
