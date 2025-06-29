import { useEffect, useState } from 'react';
import DashboardHeader from '@/components/Header/DashboardHeader.tsx';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { withNeighborhoodLayout } from '@/containers/Wrapper/NeighborhoodWrapper';
import MyEventsPage from '@/containers/NeighborhoodEvents/MyEventsPage.tsx';
import PlanningPage from '@/containers/NeighborhoodEvents/PlanningPage.tsx';
import { UserModel } from '@/domain/models/user.model.ts';

function NeighborhoodEventsPage({ uc, neighborhoodId, user }: { uc: HomeUc; neighborhoodId: string; user: UserModel }) {
    const [activeTab, setActiveTab] = useState<'planning' | 'events'>('events');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab === 'planning' || tab === 'events') {
            setActiveTab(tab);
        }
    }, []);

    const handleTabChange = (tab: 'planning' | 'events') => {
        setActiveTab(tab);
        const params = new URLSearchParams(window.location.search);
        params.set('tab', tab);
        window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    };

    const baseButtonClass = 'px-4 py-2 rounded-md font-bold transition-colors';
    const activeButtonClass = 'bg-white text-blue-500 shadow-md';
    const inactiveButtonClass = 'bg-gray-100 text-gray-600 hover:bg-gray-200';

    return (
        <div>
            <DashboardHeader />
            <div className="flex items-center justify-center p-4 md:p-6 space-x-4">
                <button
                    onClick={() => handleTabChange('events')}
                    className={`${baseButtonClass} ${activeTab === 'events' ? activeButtonClass : inactiveButtonClass}`}
                >
                    Mes événements
                </button>
                <button
                    onClick={() => handleTabChange('planning')}
                    className={`${baseButtonClass} ${
                        activeTab === 'planning' ? activeButtonClass : inactiveButtonClass
                    }`}
                >
                    Planning
                </button>
            </div>

            {activeTab === 'events' && <MyEventsPage uc={uc} neighborhoodId={neighborhoodId} user={user} />}
            {activeTab === 'planning' && <PlanningPage uc={uc} neighborhoodId={neighborhoodId} />}
        </div>
    );
}

export default withNeighborhoodLayout(NeighborhoodEventsPage);
