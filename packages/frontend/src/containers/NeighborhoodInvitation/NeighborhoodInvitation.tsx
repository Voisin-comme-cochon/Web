import { useEffect, useState } from 'react';
import { CheckCircle, Info, MapPin, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageCarousel } from '@/components/NeighborhoodInvitation/Invite/ImageCarousel';
import { MembersList } from '@/components/NeighborhoodInvitation/Invite/MembersList';
import { useAppNavigation } from '@/presentation/state/navigate.ts';

export type NeighborhoodInvite = {
    id: string;
    neighborhoodId: string;
    neighborhoodName: string;
    inviterName: string;
    description: string;
    location: {
        address: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    images: string[];
    members: {
        id: string;
        name: string;
        avatar: string;
        role?: string;
    }[];
    createdAt: string;
    expiresAt: string;
};

export type InviteTab = 'about' | 'location' | 'members';

// Mock data - à remplacer par un appel API
const mockInviteData: NeighborhoodInvite = {
    id: 'invite-1',
    neighborhoodId: 'neighborhood-62',
    neighborhoodName: 'Quartier des Lilas',
    inviterName: 'Marie Dupont',
    description: `Notre quartier est un véritable havre de paix au cœur de la ville. Nous formons une communauté bienveillante où l'entraide et la convivialité sont au centre de nos préoccupations.

Ici, nous organisons régulièrement des événements pour nous retrouver : barbecues dans le parc, marchés de producteurs locaux, ateliers de jardinage partagé, et bien d'autres activités qui renforcent les liens entre voisins.

Notre quartier dispose de nombreux espaces verts, d'une école primaire réputée, de commerces de proximité et d'un excellent réseau de transports en commun. C'est l'endroit idéal pour vivre en harmonie avec ses voisins tout en profitant des avantages de la vie urbaine.`,
    location: {
        address: 'Rue des Lilas, 75020 Paris',
        coordinates: {
            lat: 48.8566,
            lng: 2.3522,
        },
    },
    images: [
        'https://images.unsplash.com/photo-1739989934229-fd878cc0a20e?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        '/placeholder.svg?height=300&width=450',
        '/placeholder.svg?height=300&width=450',
    ],
    members: [
        {
            id: '1',
            name: 'Marie Dupont',
            avatar: '/placeholder.svg?height=48&width=48',
            role: 'Organisatrice',
        },
        {
            id: '2',
            name: 'Thomas Martin',
            avatar: '/placeholder.svg?height=48&width=48',
            role: 'Membre',
        },
        {
            id: '3',
            name: 'Sophie Bernard',
            avatar: '/placeholder.svg?height=48&width=48',
            role: 'Membre',
        },
        {
            id: '4',
            name: 'Lucas Petit',
            avatar: '/placeholder.svg?height=48&width=48',
            role: 'Membre',
        },
        {
            id: '5',
            name: 'Émilie Rousseau',
            avatar: '/placeholder.svg?height=48&width=48',
            role: 'Membre',
        },
        {
            id: '6',
            name: 'Antoine Lefevre',
            avatar: '/placeholder.svg?height=48&width=48',
            role: 'Membre',
        },
    ],
    createdAt: '2023-08-15T10:30:00Z',
    expiresAt: '2023-08-22T10:30:00Z',
};

export default function NeighborhoodInvitePage() {
    const { goMyNeighborhood } = useAppNavigation();
    const [invite, setInvite] = useState<NeighborhoodInvite | null>(null);
    const [activeTab, setActiveTab] = useState<InviteTab>('about');
    const [isJoining, setIsJoining] = useState(false);
    const [hasJoined, setHasJoined] = useState(false);

    useEffect(() => {
        // TODO: Remplacer par un appel API pour récupérer l'invitation
        const token = 'azerty';
        if (token) {
            setInvite(mockInviteData);
        }
    }, []);

    const handleJoinNeighborhood = async () => {
        setIsJoining(true);

        try {
            // Simuler l'appel API pour rejoindre le quartier
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setHasJoined(true);
        } catch (error) {
            console.error("Erreur lors de l'adhésion au quartier:", error);
        } finally {
            setIsJoining(false);
        }
    };

    if (!invite) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f2f5f8]">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-[#1a2a41] mb-2">Chargement de l'invitation...</h1>
                    <p className="text-[#1a2a41]/70">Veuillez patienter</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f2f5f8] font-sans">
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-3xl font-bold text-[#1a2a41] mb-2">
                        <span className="text-[#e36f4c]">{invite.inviterName}</span> vous invite dans son quartier !
                    </h2>
                </div>

                {hasJoined ? (
                    <Card className="max-w-2xl mx-auto">
                        <CardContent className="text-center py-12">
                            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-[#1a2a41] mb-4">Félicitations !</h3>
                            <p className="text-lg text-[#1a2a41]/70 mb-8">
                                Vous avez rejoint le quartier <strong>{invite.neighborhoodName}</strong> avec succès.
                            </p>
                            <Button
                                onClick={goMyNeighborhood()}
                                className="bg-[#e36f4c] hover:bg-[#d15e3b] text-white px-8 py-3 text-lg"
                            >
                                Accéder à mon quartier
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="max-w-4xl mx-auto">
                        <CardContent className="p-8">
                            <h3 className="text-3xl font-bold text-[#e36f4c] mb-8 text-center">
                                {invite.neighborhoodName}
                            </h3>

                            <ImageCarousel images={invite.images} alt={invite.neighborhoodName} className="mb-8" />

                            <Tabs
                                value={activeTab}
                                onValueChange={(value) => setActiveTab(value as InviteTab)}
                                className="mb-8"
                            >
                                <TabsList className="grid w-full grid-cols-3 mb-8 h-auto p-1 bg-muted rounded-lg">
                                    <TabsTrigger
                                        value="about"
                                        className="flex items-center justify-center gap-2 py-4 px-3 h-full min-h-[60px] data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all duration-200"
                                    >
                                        <Info className="h-6 w-5 flex-shrink-0" />
                                        <span className="hidden sm:inline text-center">À propos du quartier</span>
                                        <span className="sm:hidden text-center">À propos</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="location"
                                        className="flex items-center justify-center gap-2 py-4 px-3 h-full min-h-[60px] data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all duration-200"
                                    >
                                        <MapPin className="h-5 w-5 flex-shrink-0" />
                                        <span className="hidden sm:inline text-center">Où sommes nous</span>
                                        <span className="sm:hidden text-center">Localisation</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="members"
                                        className="flex items-center justify-center gap-2 py-4 px-3 h-full min-h-[60px] data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all duration-200"
                                    >
                                        <Users className="h-5 w-5 flex-shrink-0" />
                                        <span className="hidden sm:inline text-center">Qui sommes nous</span>
                                        <span className="sm:hidden text-center">Membres</span>
                                    </TabsTrigger>
                                </TabsList>

                                <div className="min-h-[300px]">
                                    <TabsContent value="about" className="mt-0">
                                        <div className="prose prose-lg max-w-none">
                                            <p className="text-[#1a2a41]/80 leading-relaxed whitespace-pre-line text-lg">
                                                {invite.description}
                                            </p>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="location" className="mt-0">
                                        <p>TODO : Mettre la map</p>
                                    </TabsContent>

                                    <TabsContent value="members" className="mt-0">
                                        <MembersList members={invite.members} />
                                    </TabsContent>
                                </div>
                            </Tabs>

                            <div className="text-center">
                                <Button
                                    onClick={handleJoinNeighborhood}
                                    disabled={isJoining}
                                    className="bg-[#e36f4c] hover:bg-[#d15e3b] text-white font-semibold py-4 px-12 text-lg"
                                >
                                    {isJoining ? 'Adhésion en cours...' : 'Rejoindre'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
