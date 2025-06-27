import { useEffect, useState } from 'react';
import { CheckCircle, Info, MapPin, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageCarousel } from '@/components/NeighborhoodInvitation/Invite/ImageCarousel';
import { InvalidInvite } from '@/components/NeighborhoodInvitation/Invite/InvalidInvite';
import { ExpiredInvite } from '@/components/NeighborhoodInvitation/Invite/ExpiredInvite';
import { AlreadyMember } from '@/components/NeighborhoodInvitation/Invite/AlreadyMember';
import { MembersList } from '@/components/NeighborhoodInvitation/Invite/MembersList';
import { useAppNavigation } from '@/presentation/state/navigate.ts';
import { NeighborhoodInvitationUc } from '@/domain/use-cases/neighborhoodInvitationUc.ts';
import { NeighborhoodFrontRepository } from '@/infrastructure/repositories/NeighborhoodFrontRepository.ts';
import { useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood.ts';
import { useToast } from '@/presentation/hooks/useToast.ts';
import ViewNeighborhoodMapBox from '@/components/MapBox/ViewNeighborhoodMapBox.tsx';
import { MemberPending } from '@/components/NeighborhoodInvitation/Invite/MemberPending.tsx';
import { MemberRefused } from '@/components/NeighborhoodInvitation/Invite/MemberRefused.tsx';

export type InviteTab = 'about' | 'location' | 'members';

type InviteStatus =
    | 'loading'
    | 'valid'
    | 'invalid'
    | 'expired'
    | 'already_member'
    | 'error'
    | 'user_pending'
    | 'user_rejected';

export default function NeighborhoodInvitePage() {
    const { goMyNeighborhood } = useAppNavigation();
    const { token } = useParams<{ token: string }>();

    const [invite, setInvite] = useState<FrontNeighborhood | null>(null);
    const [inviteStatus, setInviteStatus] = useState<InviteStatus>('loading');
    const [activeTab, setActiveTab] = useState<InviteTab>('about');
    const [isJoining, setIsJoining] = useState(false);
    const [hasJoined, setHasJoined] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        const verifyInvitation = async () => {
            if (!token) {
                setInviteStatus('invalid');
                return;
            }

            setInviteStatus('loading');
            setError(null);

            try {
                const repository = new NeighborhoodFrontRepository();
                const invitationUc = new NeighborhoodInvitationUc(repository);

                const response = await invitationUc.verifyInvitation(token);

                if (response.status === 200 && response.data) {
                    setInvite(response.data);
                    setInviteStatus('valid');
                } else if (response.status === 410) {
                    setInviteStatus('expired');
                } else {
                    setInviteStatus('invalid');
                }
            } catch (err) {
                if (err instanceof AxiosError) {
                    console.error("Erreur lors de la vérification de l'invitation:", err);
                    if (err.response?.status === 404 || err.response?.data?.code === 'invalid_token') {
                        setInviteStatus('invalid');
                    } else if (err.response?.status === 410 || err.response?.data?.status === 'expired') {
                        setInviteStatus('expired');
                    } else if (err.response?.status === 400 && err.response?.data?.code === 'user_already_member') {
                        setInviteStatus('already_member');
                    } else if (err.response?.status === 400 && err.response?.data?.code === 'user_pending') {
                        setInviteStatus('user_pending');
                    } else if (err.response?.status === 400 && err.response?.data?.code === 'user_rejected') {
                        setInviteStatus('user_rejected');
                    } else {
                        setInviteStatus('error');
                        setError(err.message || "Une erreur est survenue lors de la vérification de l'invitation");
                    }
                } else {
                    setInviteStatus('error');
                    setError('Une erreur inattendue est survenue');
                }
            }
        };

        verifyInvitation();
    }, [token]);

    const handleJoinNeighborhood = async () => {
        if (!invite || !token) return;

        setIsJoining(true);
        try {
            const repository = new NeighborhoodFrontRepository();
            const invitationUc = new NeighborhoodInvitationUc(repository);

            const response = await invitationUc.acceptInvitation(token);
            if (response.status !== 201 || !response.data.success) {
                showError("Erreur lors de l'adhésion au quartier", 'Veuillez réessayer plus tard.');
                return;
            }

            showSuccess(
                'Vous avez rejoint le quartier avec succès !',
                "L'administrateur a été informé de votre adhésion. Vous serez prévenu par mail lorsque vous serez accepté."
            );
            setHasJoined(true);
        } catch (error) {
            console.error("Erreur lors de l'adhésion au quartier:", error);
            setError("Erreur lors de l'adhésion au quartier");
        } finally {
            setIsJoining(false);
        }
    };

    if (inviteStatus === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f2f5f8]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e36f4c] mx-auto mb-4"></div>
                    <h1 className="text-2xl font-bold text-[#1a2a41] mb-2">Vérification de l'invitation...</h1>
                    <p className="text-[#1a2a41]/70">Veuillez patienter</p>
                </div>
            </div>
        );
    }

    if (inviteStatus === 'invalid') {
        return <InvalidInvite />;
    }

    if (inviteStatus === 'already_member') {
        return <AlreadyMember />;
    }

    if (inviteStatus === 'user_rejected') {
        return <MemberRefused />;
    }

    if (inviteStatus === 'user_pending') {
        return <MemberPending />;
    }

    if (inviteStatus === 'expired') {
        return <ExpiredInvite />;
    }

    if (inviteStatus === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f2f5f8]">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold text-[#1a2a41] mb-2">Erreur</h1>
                        <p className="text-[#1a2a41]/70 mb-6">
                            {error || "Une erreur est survenue lors du chargement de l'invitation"}
                        </p>
                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-[#e36f4c] hover:bg-[#d15e3b] text-white mr-2"
                        >
                            Réessayer
                        </Button>
                        <Button asChild variant="outline">
                            <a href="/">Retour à l'accueil</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!invite) {
        return <InvalidInvite />;
    }

    return (
        <div className="min-h-screen bg-[#f2f5f8] font-sans">
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-3xl font-bold text-[#1a2a41] mb-2">
                        <span className="text-[#e36f4c]">Vous avez été invité dans un quartier !</span>
                    </h2>
                </div>

                {hasJoined ? (
                    <Card className="max-w-2xl mx-auto">
                        <CardContent className="text-center py-12">
                            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-[#1a2a41] mb-4">Félicitations !</h3>
                            <p className="text-lg text-[#1a2a41]/70 mb-2">
                                Vous avez rejoint le quartier <strong>{invite.name}</strong> avec succès.
                            </p>
                            <p className={'text-gray-500 text-xs text-center mb-8'}>
                                Il se peut que le quartier soit en attente de validation par un administrateur, vous
                                serez contacté de la réponse par email.
                            </p>
                            <Button
                                onClick={() => goMyNeighborhood()}
                                className="bg-[#e36f4c] hover:bg-[#d15e3b] text-white px-8 py-3 text-lg"
                            >
                                Accéder à mon quartier
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="max-w-4xl mx-auto">
                        <CardContent className="p-8">
                            <h3 className="text-3xl font-bold text-[#e36f4c] mb-2 text-center">{invite.name}</h3>
                            {invite.status === 'waiting' && (
                                <p className={'text-xs text-gray-500 mb-4 text-center'}>
                                    Ce quartier est en attente de validation, vous serez prévenu par mail lorsqu'il sera
                                    accepté.
                                </p>
                            )}
                            <ImageCarousel
                                images={invite.images ? invite.images.map((image) => image.url) : []}
                                alt={invite.name}
                                className="mb-8"
                            />

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

                                <div>
                                    <TabsContent value="about" className="mt-0">
                                        <div className="prose prose-lg max-w-none">
                                            <p className="text-[#1a2a41]/80 leading-relaxed whitespace-pre-line text-lg">
                                                {invite.description}
                                            </p>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="location" className="mt-0">
                                        <div className="space-y-4">
                                            <div className="h-96 w-full">
                                                <ViewNeighborhoodMapBox geometry={invite.geo} />
                                            </div>
                                        </div>
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
