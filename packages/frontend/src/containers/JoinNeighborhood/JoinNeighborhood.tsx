'use client';

import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood.ts';
import MinimalHeader from '@/components/Header/MinimalHeader.tsx';
import { useAppNavigation } from '@/presentation/state/navigate.ts';
import { withHeaderDataOnlyUserCheck } from '@/containers/Wrapper/Wrapper.tsx';
import { UserModel } from '@/domain/models/user.model.ts';

function JoinNeighborhood({ uc, user }: { uc: HomeUc; user: UserModel }) {
    const [neighborhoods, setNeighborhoods] = useState<FrontNeighborhood[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const { goCreateNeighborhood, goNeighborhoodDetails } = useAppNavigation();

    useEffect(() => {
        const fetchNeighborhoods = async () => {
            try {
                const [latitude, longitude] = await uc.getUserLocation(user.id);
                const data = await uc.getNeighborhoodByPos(longitude, latitude);
                setNeighborhoods(data);
            } catch (error) {
                console.error('Failed to fetch neighborhoods:', error);
            }
        };
        fetchNeighborhoods();
    }, [uc, user]);

    const filteredNeighborhoods = neighborhoods.filter((n) => n.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <>
            <MinimalHeader />
            <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
                <h1 className="text-2xl font-bold mb-4 text-center">
                    <span className="text-orange font-bold">Rejoindre</span> votre quartier
                </h1>
                <p className="mb-6 text-gray-600 text-center">
                    Plusieurs quartiers sont disponibles pour votre adresse, vous pouvez en rejoindre autant que vous
                    voulez.
                </p>

                {/* Search Bar */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Rechercher par nom..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange"
                    />
                </div>

                {filteredNeighborhoods && filteredNeighborhoods.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto space-y-6">
                        {filteredNeighborhoods.map((neighborhood) => (
                            <div
                                key={neighborhood.id}
                                className="flex items-center justify-between bg-gray-50 rounded-lg p-4 shadow-sm"
                            >
                                <div className="flex items-center space-x-4">
                                    {neighborhood.images &&
                                    neighborhood.images.length > 0 &&
                                    neighborhood.images[0]?.url ? (
                                        <img
                                            src={neighborhood.images[0].url}
                                            alt={neighborhood.name}
                                            className="w-16 h-16 object-cover rounded-md cursor-pointer"
                                            onClick={() => setSelectedImage(neighborhood.images![0]!.url!)}
                                        />
                                    ) : (
                                        <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded-md text-gray-400">
                                            <span className="material-symbols-outlined text-3xl">no_photography</span>
                                        </div>
                                    )}
                                    <p className="font-medium text-lg">{neighborhood.name}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        className="bg-white text-orange border-orange border hover:bg-white hover:text-orange"
                                        onClick={() => goNeighborhoodDetails(neighborhood.id)}
                                    >
                                        Infos
                                    </Button>
                                    <Button
                                        variant="orange"
                                        onClick={() => (window.location.href = `/neighborhood/${neighborhood.id}`)}
                                    >
                                        Rejoindre
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 mb-6">Aucun quartier trouvé pour votre adresse.</p>
                )}

                <div className="flex justify-center mt-8 flex-col items-center">
                    <p className={'text-xs mb-2 text-gray-500'}>Vous n'avez pas trouvé votre bonheur ?</p>
                    <Button
                        className={'bg-white text-orange border-orange border hover:bg-white hover:text-orange'}
                        onClick={goCreateNeighborhood}
                    >
                        Créer mon quartier
                    </Button>
                </div>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                    onClick={() => setSelectedImage(null)}
                >
                    <img
                        src={selectedImage}
                        alt="En grand"
                        className="max-w-full max-h-full rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}

const join = withHeaderDataOnlyUserCheck(JoinNeighborhood);
export default join;
