import Header from '@/components/Header/Header.tsx';
import { useEffect, useState } from 'react';
import MyNeighborhoodPage from '@/containers/Home/MyNeighborhoodPage.tsx';
import NeighborhoodEventsPage from '@/containers/Home/NeighborhoodEventsPage.tsx';
import NeighborhoodJournalPage from '@/containers/Home/NeighborhoodJournalPage.tsx';
import NeighborhoodMaterialsPage from '@/containers/Home/NeighborhoodMaterialsPage.tsx';

const pages: { [key: number]: JSX.Element } = {
    1: <MyNeighborhoodPage />,
    2: <NeighborhoodEventsPage />,
    3: <NeighborhoodJournalPage />,
    4: <NeighborhoodMaterialsPage />,
};

export default function HomePage() {
    const [page, setPage] = useState<number>(1);
    const [neighborhoodId, setNeighborhoodId] = useState<number>(-1);
    useEffect(() => {
        console.log('Current neighborhood ID:', neighborhoodId);
    }, [neighborhoodId]);

    if (neighborhoodId === -1) {
        return (
            <>
                <Header isConnected setPage={setPage} page={page} setNeighborhoodId={setNeighborhoodId} />
                <div className="flex items-center justify-center h-[calc(100vh-64px)] flex-col">
                    <p className="text-lg">Veuillez sélectionner un quartier pour continuer.</p>
                </div>
            </>
        );
    }
    return (
        <>
            <Header isConnected setPage={setPage} page={page} setNeighborhoodId={setNeighborhoodId} />
            {pages[page] || <MyNeighborhoodPage />}
        </>
    );
}
