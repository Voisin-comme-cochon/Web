import Header from '@/components/Header/Header.tsx';
import { useEffect, useState } from 'react';
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

const pages: { [key: number]: JSX.Element } = {
    1: <MyNeighborhoodPage />,
    2: <NeighborhoodEventsPage />,
    3: <NeighborhoodJournalPage />,
    4: <NeighborhoodMaterialsPage />,
};

export default function HomePage() {
    const [page, setPage] = useState<number>(1);
    const [neighborhoodId, setNeighborhoodId] = useState<number>(-1);
    const [user, setUser] = useState<UserModel | null>(null);
    const [neighborhoods, setNeighborhoods] = useState<FrontNeighborhood[] | null>(null);
    const uc = new HomeUc(new UserFrontRepository(), new NeighborhoodFrontRepository());

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

    useEffect(() => {
        console.log('Current neighborhood ID:', neighborhoodId);
    }, [neighborhoodId]);

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
            {pages[page] || <MyNeighborhoodPage />}
        </>
    );
}
