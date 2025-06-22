import { EventModel } from '@/domain/models/event.model.ts';
import { useEffect, useMemo, useState } from 'react';
import PreviewEvent from '@/components/PreviewEvent/PreviewEvent.tsx';
import NotCreatedEvent from '@/components/PreviewEvent/NotCreatedEvent.tsx';
import { useAppNavigation } from '@/presentation/state/navigate.ts';
import { DecodedUser } from '@/domain/models/DecodedUser.ts';
import { jwtDecode } from 'jwt-decode';
import { UserModel } from '@/domain/models/user.model.ts';
import { UserFrontRepository } from '@/infrastructure/repositories/UserFrontRepository.ts';
import { NeighborhoodFrontRepository } from '@/infrastructure/repositories/NeighborhoodFrontRepository.ts';
import { EventRepository } from '@/infrastructure/repositories/EventRepository.ts';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import DashboardHeader from '@/components/Header/DashboardHeader.tsx';
import { TagRepository } from '@/infrastructure/repositories/TagRepository.ts';
import ChatButton from '@/components/Messaging/chat-button.tsx';

export default function MyNeighborhoodPage() {
    const [events, setEvents] = useState<EventModel[]>([]);
    const { goNeighborhoodEvents } = useAppNavigation();
    const [user, setUser] = useState<UserModel | null>(null);
    const neighborhoodId = localStorage.getItem('neighborhoodId');
    const uc = useMemo(
        () =>
            new HomeUc(
                new UserFrontRepository(),
                new NeighborhoodFrontRepository(),
                new EventRepository(),
                new TagRepository()
            ),
        []
    );
    useEffect(() => {
        const fetchConnectedData = async () => {
            const token = localStorage.getItem('jwt');
            if (token) {
                try {
                    const decoded: DecodedUser = jwtDecode(token);
                    const fetchedUser = await uc.getUserById(decoded.id);
                    setUser(fetchedUser);
                } catch (error) {
                    console.error('Failed to fetch user :', error);
                }
            } else {
                console.log('No JWT token found in localStorage.');
            }
        };

        fetchConnectedData();
    }, []);

    useEffect(() => {
        const fetchEvents = async () => {
            const events = await uc.getNeighborhoodEvents(Number(neighborhoodId), 3, 1);
            setEvents(events);
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
                <div className={'flex items-center gap-2 cursor-pointer'} onClick={goNeighborhoodEvents}>
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
            <ChatButton />
        </div>
    );
}
