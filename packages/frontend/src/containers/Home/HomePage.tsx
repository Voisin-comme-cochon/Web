import Header from '@/components/Header/Header.tsx';
import { useState } from 'react';
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
    const [neighborhoodId, setNeighborhoodId] = useState<number>(1);

    return (
        <>
            <Header isConnected setPage={setPage} page={page} />
            {pages[page] || <MyNeighborhoodPage />}
        </>
    );
}
