import { useEffect, useState } from 'react';
import logo from '@/assets/images/logoWebV1Light.webp';
import AvatarComponent from '@/components/AvatarComponent/AvatarComponent';
import ComboboxComponent from '@/components/ComboboxComponent/ComboboxComponent';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood.ts';
import { UserModel } from '@/domain/models/user.model.ts';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { UserFrontRepository } from '@/infrastructure/repositories/UserFrontRepository.ts';
import { NeighborhoodFrontRepository } from '@/infrastructure/repositories/NeighborhoodFrontRepository.ts';
import { EventRepository } from '@/infrastructure/repositories/EventRepository.ts';
import { jwtDecode } from 'jwt-decode';
import { DecodedUser } from '@/domain/models/DecodedUser.ts';
import { useAppNavigation } from '@/presentation/state/navigate.ts';

export default function DashboardHeader() {
    const [user, setUser] = useState<UserModel | null>(null);
    const [neighborhoods, setNeighborhoods] = useState<FrontNeighborhood[]>([]);
    const { goMyNeighborhood, goNeighborhoodEvents, goNeighborhoodJournal, goNeighborhoodMat } = useAppNavigation();
    const [page, setPage] = useState<string>('');

    useEffect(() => {
        setPage(window.location.href.split('/')[3] || '');
    }, []);

    useEffect(() => {
        const uc = new HomeUc(new UserFrontRepository(), new NeighborhoodFrontRepository(), new EventRepository());
        const fetchData = async () => {
            const token = localStorage.getItem('jwt');
            if (token) {
                try {
                    const decoded: DecodedUser = jwtDecode(token);
                    const fetchedUser = await uc.getUserById(decoded.id);
                    setUser(fetchedUser);

                    const fetchedNeighborhoods = await uc.getMyNeighborhoods(fetchedUser.id);
                    setNeighborhoods(fetchedNeighborhoods);
                } catch (error) {
                    console.error('Failed to fetch user or neighborhoods:', error);
                }
            }
        };
        fetchData();
    }, []);

    return (
        <header className="flex items-center justify-between w-full p-4 bg-white h-[64px]">
            <img src={logo} alt="logo" className="max-w-[150px] h-auto cursor-pointer" onClick={goMyNeighborhood} />
            <div className="flex flex-1 justify-center gap-8">
                {[
                    {
                        id: 1,
                        icon: 'apartment',
                        label: 'Mon quartier',
                        action: goMyNeighborhood,
                        path: ['my-neighborhood'],
                    },
                    {
                        id: 2,
                        icon: 'calendar_today',
                        label: 'Événements',
                        action: goNeighborhoodEvents,
                        path: ['neighborhood-events', 'events'],
                    },
                    {
                        id: 3,
                        icon: 'newsmode',
                        label: 'Journal',
                        action: goNeighborhoodJournal,
                        path: ['neighborhood-journal'],
                    },
                    {
                        id: 4,
                        icon: 'emoji_objects',
                        label: 'Matériel',
                        action: goNeighborhoodMat,
                        path: ['neighborhood-materials'],
                    },
                ].map(({ id, icon, label, action, path }) => (
                    <div
                        key={id}
                        className="flex flex-col items-center gap-1 cursor-pointer"
                        onClick={() => {
                            action();
                        }}
                    >
                        <span
                            className={`material-symbols-outlined ${path.includes(page) ? 'text-black' : 'text-gray-400'}`}
                        >
                            {icon}
                        </span>
                        <p className={`text-xs ${path.includes(page) ? 'text-black' : 'text-gray-400'}`}>{label}</p>
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-4">
                <ComboboxComponent neighborhoods={neighborhoods} />
                {user && <AvatarComponent user={user} />}
            </div>
        </header>
    );
}
