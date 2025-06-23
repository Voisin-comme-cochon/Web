import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { useEffect, useState } from 'react';
import NeighborhoodManageInformationPage from '@/containers/ManageNeighborhood/NeighborhoodManageInformationPage.tsx';
import NeighborhoodManagePhotosPage from '@/containers/ManageNeighborhood/NeighborhoodManagePhotosPage.tsx';
import NeighborhoodManageInvitationsPage from '@/containers/ManageNeighborhood/NeighborhoodManageInvitationsPage.tsx';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood.ts';

type SubPage = 'informations' | 'photos' | 'invitations';

export default function NeighborhoodManagePage({ uc, neighborhoodId }: { uc: HomeUc; neighborhoodId: number }) {
    const [activeTab, setActiveTab] = useState<SubPage>('informations');
    const [neighborhood, setNeighborhood] = useState<FrontNeighborhood>();

    useEffect(() => {
        const fetchNeighborhood = async () => {
            const nb = await uc.getNeighborhoodById(neighborhoodId);
            setNeighborhood(nb);
        };

        fetchNeighborhood();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab && ['informations', 'photos', 'invitations'].includes(tab)) {
            setActiveTab(tab as SubPage);
        }
    }, []);

    const handleTabChange = (tab: SubPage) => {
        setActiveTab(tab);
        const params = new URLSearchParams(window.location.search);
        params.set('tab', tab);
        window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    };

    const baseButtonClass = 'px-4 py-2 rounded-md font-bold transition-colors';
    const activeButtonClass = 'bg-white text-black shadow-md';
    const inactiveButtonClass = 'bg-gray-100 text-gray-600 hover:bg-gray-200';

    return (
        <div className="flex justify-center items-center mb-12">
            <div className="w-full max-w-5xl bg-white border-t-4 border-orange rounded-xl shadow-lg p-6">
                <div className={'flex justify-around mb-6 gap-4'}>
                    <button
                        onClick={() => handleTabChange('informations')}
                        className={`${baseButtonClass} ${activeTab === 'informations' ? activeButtonClass : inactiveButtonClass} w-full`}
                    >
                        <div className={'flex items-center justify-center gap-2'}>
                            <span className="material-symbols-outlined">edit_square</span>
                            Informations
                        </div>
                    </button>
                    <button
                        onClick={() => handleTabChange('photos')}
                        className={`${baseButtonClass} ${activeTab === 'photos' ? activeButtonClass : inactiveButtonClass} w-full`}
                    >
                        <div className={'flex items-center justify-center gap-2'}>
                            <span className="material-symbols-outlined">imagesmode</span>
                            Photos
                        </div>
                    </button>
                    <button
                        onClick={() => handleTabChange('invitations')}
                        className={`${baseButtonClass} ${activeTab === 'invitations' ? activeButtonClass : inactiveButtonClass} w-full`}
                    >
                        <div className={'flex items-center justify-center gap-2'}>
                            <span className="material-symbols-outlined">group</span>
                            Invitations
                        </div>
                    </button>
                </div>

                {activeTab === 'informations' && neighborhood && (
                    <NeighborhoodManageInformationPage uc={uc} neighborhood={neighborhood} />
                )}
                {activeTab === 'photos' && neighborhood && (
                    <NeighborhoodManagePhotosPage uc={uc} neighborhood={neighborhood} />
                )}
                {activeTab === 'invitations' && neighborhood && (
                    <NeighborhoodManageInvitationsPage uc={uc} neighborhood={neighborhood} />
                )}
            </div>
        </div>
    );
}
