import Header from '@/components/Header/Header.tsx';
import { useCallback, useEffect, useState } from 'react';
import MyNeighborhoodPage from '@/containers/Home/MyNeighborhoodPage.tsx';
import NeighborhoodEventsPage from '@/containers/Home/NeighborhoodEventsPage.tsx';
import NeighborhoodJournalPage from '@/containers/Home/NeighborhoodJournalPage.tsx';
import NeighborhoodMaterialsPage from '@/containers/Home/NeighborhoodMaterialsPage.tsx';
import { UserModel } from '@/domain/models/user.model.ts';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { UserFrontRepository } from '@/infrastructure/repositories/UserFrontRepository.ts';
import { NeighborhoodFrontRepository } from '@/infrastructure/repositories/NeighborhoodFrontRepository.ts';
import { DecodedUser } from '@/domain/models/DecodedUser.ts';
import { jwtDecode } from 'jwt-decode';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood.ts';
import { EventRepository } from '@/infrastructure/repositories/EventRepository.ts';

function useSetPageWithStorage(key = 'page') {
    const [page, setPage] = useState<number>(() => {
        const stored = localStorage.getItem(key);
        return stored ? parseInt(stored, 10) : 1;
    });

    const handleSetPage = useCallback(
        (newPage: number) => {
            setPage(newPage);
            localStorage.setItem(key, newPage.toString());
        },
        [key]
    );

    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === key && e.newValue) {
                setPage(parseInt(e.newValue, 10));
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [key]);

    return [page, handleSetPage] as const;
}

export default function HomePage() {
    const [page, setPage] = useSetPageWithStorage();
    const [neighborhoodId, setNeighborhoodId] = useState<number>(-1);
    const [user, setUser] = useState<UserModel | null>(null);
    const [neighborhoods, setNeighborhoods] = useState<FrontNeighborhood[] | null>(null);
    const uc = new HomeUc(new UserFrontRepository(), new NeighborhoodFrontRepository(), new EventRepository());

    useEffect(() => {
        const fetchConnectedData = async () => {
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
            } else {
                console.log('No JWT token found in localStorage.');
            }
        };

        fetchConnectedData();
    }, []);

    if (neighborhoodId === -1) {
        return (
            <>
                <Header
                    isConnected
                    setPage={setPage}
                    page={page}
                    setNeighborhoodId={setNeighborhoodId}
                    user={user}
                    neighborhoods={neighborhoods}
                />
                <div className="flex items-center justify-center h-[calc(100vh-64px)] flex-col">
                    <p className="text-lg">Veuillez sélectionner un quartier pour continuer.</p>
                </div>
            </>
        );
    }
    const pages: { [key: number]: JSX.Element } = {
        1: <MyNeighborhoodPage user={user} neighborhoodId={neighborhoodId} uc={uc} setPage={setPage} />,
        2: <NeighborhoodEventsPage />,
        3: <NeighborhoodJournalPage />,
        4: <NeighborhoodMaterialsPage />,
    };

    return (
        <>
            <Header
                isConnected
                setPage={setPage}
                page={page}
                setNeighborhoodId={setNeighborhoodId}
                user={user}
                neighborhoods={neighborhoods}
            />
            {pages[page] || (
                <MyNeighborhoodPage user={user} neighborhoodId={neighborhoodId} uc={uc} setPage={setPage} />
            )}
        </>
    );
}
