import { withHeaderData } from '@/containers/Wrapper/Wrapper.tsx';
import DashboardHeader from '@/components/Header/DashboardHeader.tsx';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { UserModel } from '@/domain/models/user.model.ts';
import { useEffect, useState } from 'react';
import EventManagePage from '@/containers/ManageNeighborhood/EventManagePage.tsx';
import MemberManagePage from '@/containers/ManageNeighborhood/MemberManagePage.tsx';
import SupportManagePage from '@/containers/ManageNeighborhood/SupportManagePage.tsx';
import NeighborhoodManagePage from '@/containers/ManageNeighborhood/NeighborhoodManagePage.tsx';
import { useAppNavigation } from '@/presentation/state/navigate.ts';

type LowerPagesManage = 'neighborhood' | 'members' | 'events' | 'support';

function ManageNeighborhood({ uc, neighborhoodId, user }: { uc: HomeUc; neighborhoodId: string; user: UserModel }) {
    const [activeTab, setActiveTab] = useState<LowerPagesManage>('neighborhood');
    const { goMyNeighborhood } = useAppNavigation();
    useEffect(() => {
        const isAdmin = async () => {
            const admin = await uc.isUserAdminOfNeighborhood(user.id, neighborhoodId);
            if (!admin) {
                goMyNeighborhood();
            }
        };
        isAdmin();

        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab && ['neighborhood', 'members', 'events', 'support'].includes(tab)) {
            setActiveTab(tab as LowerPagesManage);
        }
    }, []);

    const handleTabChange = (tab: LowerPagesManage) => {
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
                    onClick={() => handleTabChange('neighborhood')}
                    className={`${baseButtonClass} ${activeTab === 'neighborhood' ? activeButtonClass : inactiveButtonClass}`}
                >
                    Quartier
                </button>
                <button
                    onClick={() => handleTabChange('members')}
                    className={`${baseButtonClass} ${activeTab === 'members' ? activeButtonClass : inactiveButtonClass}`}
                >
                    Membres
                </button>
                <button
                    onClick={() => handleTabChange('events')}
                    className={`${baseButtonClass} ${activeTab === 'events' ? activeButtonClass : inactiveButtonClass}`}
                >
                    Événements
                </button>
                <button
                    onClick={() => handleTabChange('support')}
                    className={`${baseButtonClass} ${
                        activeTab === 'support' ? activeButtonClass : inactiveButtonClass
                    }`}
                >
                    Support
                </button>
            </div>

            {activeTab === 'events' && <EventManagePage uc={uc} neighborhoodId={neighborhoodId} />}
            {activeTab === 'members' && <MemberManagePage uc={uc} neighborhoodId={neighborhoodId} />}
            {activeTab === 'support' && <SupportManagePage uc={uc} neighborhoodId={neighborhoodId} />}
            {activeTab === 'neighborhood' && <NeighborhoodManagePage uc={uc} neighborhoodId={neighborhoodId} />}
        </div>
    );
}

export default withHeaderData(ManageNeighborhood);
