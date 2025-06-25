import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Info, MapPin, Users } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageCarousel } from '@/components/NeighborhoodInvitation/Invite/ImageCarousel';
import MapBox from '@/components/MapBox/MapBox';
import { MembersList } from '@/components/NeighborhoodInvitation/Invite/MembersList';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood';
import { NeighborhoodFrontRepository } from '@/infrastructure/repositories/NeighborhoodFrontRepository';
import { InviteTab } from '@/containers/NeighborhoodInvitation/NeighborhoodInvitation.tsx';
import { NeighborhoodUserModel } from '@/domain/models/NeighborhoodUser.model.ts';
import MinimalHeader from '@/components/Header/MinimalHeader.tsx';
import { AxiosError } from 'axios';

export const NeighborhoodDetailsPage: React.FC = () => {
    const { neighborhoodId } = useParams<{ neighborhoodId: string }>();
    const [neighborhood, setNeighborhood] = useState<FrontNeighborhood | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<InviteTab>('about');

    useEffect(() => {
        const fetchNeighborhood = async () => {
            if (!neighborhoodId) {
                setError('ID de quartier manquant dans l’URL.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const repository = new NeighborhoodFrontRepository();
                const neighborhood = await repository.getNeighborhoodById(neighborhoodId);
                const users: NeighborhoodUserModel[] = await repository.getMembersByNeighborhoodId(neighborhoodId);
                neighborhood.members = users.map((user) => ({
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profileImageUrl: user.profileImageUrl,
                    neighborhoodRole: user.neighborhoodRole,
                }));
                setNeighborhood(neighborhood);
            } catch (err) {
                console.error('Erreur fetch quartier:', err);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setError((err as AxiosError).response?.data?.message || 'Erreur lors de la récupération du quartier.');
            } finally {
                setLoading(false);
            }
        };

        fetchNeighborhood();
    }, [neighborhoodId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f2f5f8]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e36f4c]"></div>
            </div>
        );
    }

    if (error || !neighborhood) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f2f5f8]">
                <Card className="max-w-md">
                    <CardContent className="p-6 text-center">
                        <h2 className="text-xl font-bold mb-2">Erreur</h2>
                        <p className="text-[#1a2a41]/70">{error || 'Quartier introuvable.'}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f2f5f8] font-sans">
            <MinimalHeader />
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <Card className="max-w-4xl mx-auto">
                    <CardContent className="p-8">
                        <h3 className="text-3xl font-bold text-[#e36f4c] mb-8 text-center">{neighborhood.name}</h3>

                        <ImageCarousel
                            images={neighborhood.images?.map((img) => img.url) || []}
                            alt={neighborhood.name}
                            className="mb-8"
                        />

                        <Tabs
                            value={activeTab}
                            onValueChange={(value) => setActiveTab(value as typeof activeTab)}
                            className="mb-8"
                        >
                            <TabsList className="grid w-full grid-cols-3 mb-8 h-auto p-1 bg-muted rounded-lg">
                                <TabsTrigger
                                    value="about"
                                    className="flex items-center justify-center gap-2 py-4 px-3 rounded-md"
                                >
                                    <Info className="h-6 w-5" />
                                    <span>À propos</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="location"
                                    className="flex items-center justify-center gap-2 py-4 px-3 rounded-md"
                                >
                                    <MapPin className="h-5 w-5" />
                                    <span>Localisation</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="members"
                                    className="flex items-center justify-center gap-2 py-4 px-3 rounded-md"
                                >
                                    <Users className="h-5 w-5" />
                                    <span>Membres</span>
                                </TabsTrigger>
                            </TabsList>

                            <div>
                                <TabsContent value="about">
                                    <div className="prose prose-lg max-w-none">
                                        <p className="text-[#1a2a41]/80 leading-relaxed whitespace-pre-line text-lg">
                                            {neighborhood.description}
                                        </p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="location">
                                    <div className="h-96 w-full">
                                        <MapBox
                                            canCreate={false}
                                            showDetails={false}
                                            onGeoSelect={() => {}}
                                            specificNeighborhood={
                                                neighborhood.geo
                                                    ? [
                                                          {
                                                              type: 'Feature',
                                                              geometry: neighborhood.geo,
                                                              properties: {},
                                                          },
                                                      ]
                                                    : []
                                            }
                                            centerOnNeighborhood={true}
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="members">
                                    <MembersList members={neighborhood.members} />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default NeighborhoodDetailsPage;
