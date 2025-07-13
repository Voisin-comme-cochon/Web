import { EventModel } from '@/domain/models/event.model.ts';
import { useEffect, useState } from 'react';
import PreviewEvent from '@/components/PreviewEvent/PreviewEvent.tsx';
import NotCreatedEvent from '@/components/PreviewEvent/NotCreatedEvent.tsx';
import { useAppNavigation } from '@/presentation/state/navigate.ts';
import { UserModel } from '@/domain/models/user.model.ts';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import DashboardHeader from '@/components/Header/DashboardHeader.tsx';
import { withNeighborhoodLayoutUserCheck } from '@/containers/Wrapper/NeighborhoodWrapper';
import { useLoanRequests } from '@/presentation/hooks/useLoanRequests';
import { useLoans } from '@/presentation/hooks/useLoans';
import { LoanRequestStatus } from '@/domain/models/loan-request.model';
import { LoanStatus } from '@/domain/models/loan.model';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CarouselRecommendation from '@/components/CarouseulRecommendation/CarouselRecommendation.tsx';

function MyNeighborhoodPage({ user, uc }: { user: UserModel | null; uc: HomeUc }) {
    const [events, setEvents] = useState<EventModel[]>([]);
    const { goNeighborhoodEvents, goItems } = useAppNavigation();
    const neighborhoodId = localStorage.getItem('neighborhoodId');

    // Hooks pour les prêts et emprunts
    const { receivedRequests } = useLoanRequests();
    const { myLoans, lentItems } = useLoans();

    useEffect(() => {
        const fetchEvents = async () => {
            if (neighborhoodId) {
                const events = await uc.getNeighborhoodEvents(Number(neighborhoodId), 3, 1);
                setEvents(events);
            }
        };
        fetchEvents();
    }, [neighborhoodId, uc]);

    if (!user || !neighborhoodId) {
        return (
            <>
                <DashboardHeader />
                <div className="flex items-center justify-center h-[calc(100vh-64px)] flex-col">
                    <p className="text-lg">Veuillez sélectionner un quartier pour continuer.</p>
                </div>
            </>
        );
    }

    return (
        <div>
            <DashboardHeader />
            <div className="px-32 pt-8 w-full bg-white flex flex-row gap-4 h-[234px]">
                {user.profileImageUrl ? (
                    <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
                        <img
                            src={user.profileImageUrl ?? undefined}
                            alt="User Profile"
                            className="w-14 h-14 rounded-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-gray-700">person</span>
                    </div>
                )}
                <div>
                    <p className={'font-bold text-xl'}>
                        <span className={'text-orange'}>Bonjour</span> {user.firstName},
                    </p>
                    <p className={'text-sm'}>Quoi de neuf ?</p>
                </div>
            </div>
            <div className={'px-32 relative -mt-24'}>
                <div className={'flex items-center gap-2 cursor-pointer'} onClick={goNeighborhoodEvents}>
                    <p>Prochains évènements</p>
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                    {events.length > 0 ? (
                        events.map((event: EventModel) => <PreviewEvent key={event.id} event={event} />)
                    ) : (
                        <NotCreatedEvent />
                    )}
                </div>

                {/* Section Mes emprunts */}
                <div className="mt-12">
                    <div className={'flex items-center gap-2 cursor-pointer'} onClick={goItems}>
                        <p>Mes prêts et emprunts</p>
                        <span className="material-symbols-outlined text-base">chevron_right</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {/* Demandes reçues */}
                        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={goItems}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-600">inbox</span>
                                    <CardTitle className="text-lg">Demandes reçues</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {receivedRequests.filter((r) => r.status === LoanRequestStatus.PENDING).length > 0 ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="default" className="text-sm">
                                                {
                                                    receivedRequests.filter(
                                                        (r) => r.status === LoanRequestStatus.PENDING
                                                    ).length
                                                }{' '}
                                                en attente
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Vous avez des demandes d'emprunt à traiter
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600">Aucune demande en attente</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Mes emprunts en cours */}
                        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={goItems}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-600">inventory_2</span>
                                    <CardTitle className="text-lg">Mes emprunts</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {myLoans.filter((l) => l.status === LoanStatus.ACTIVE).length > 0 ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-sm">
                                                {myLoans.filter((l) => l.status === LoanStatus.ACTIVE).length} en cours
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">Objets que vous empruntez actuellement</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600">Aucun emprunt en cours</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Mes prêts en cours */}
                        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={goItems}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-orange-600">handshake</span>
                                    <CardTitle className="text-lg">Mes prêts</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {lentItems.filter((l) => l.status === LoanStatus.ACTIVE).length > 0 ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-sm">
                                                {lentItems.filter((l) => l.status === LoanStatus.ACTIVE).length} en
                                                cours
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">Objets que vous prêtez actuellement</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600">Aucun prêt en cours</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-4 text-center">
                        <Button variant="outline" onClick={goItems} className="w-full sm:w-auto">
                            <span className="material-symbols-outlined text-sm mr-2">open_in_new</span>
                            Voir tous mes prêts et emprunts
                        </Button>
                    </div>

                    <p>Mes voisins</p>
                    <CarouselRecommendation neighborhoodId={neighborhoodId} uc={uc} />
                </div>
            </div>
        </div>
    );
}

export default withNeighborhoodLayoutUserCheck(MyNeighborhoodPage);
