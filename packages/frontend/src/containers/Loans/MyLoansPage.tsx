import { useState, useEffect } from 'react';
import { UserModel } from '@/domain/models/user.model';
import { HomeUc } from '@/domain/use-cases/homeUc';
import { useLoanRequests, useLoanRequestActions } from '@/presentation/hooks/useLoanRequests';
import { useLoans, useReturnLoan } from '@/presentation/hooks/useLoans';
import DashboardHeader from '@/components/Header/DashboardHeader';
import LoanRequestCard from '@/components/LoanRequestCard/LoanRequestCard';
import LoanCard from '@/components/LoanCard/LoanCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { withNeighborhoodLayout } from '@/containers/Wrapper/NeighborhoodWrapper';
import { LoanRequestStatus } from '@/domain/models/loan-request.model';
import { LoanStatus } from '@/domain/models/loan.model';

interface MyLoansPageProps {
    user: UserModel;
    neighborhoodId: string;
    uc: HomeUc;
}

function MyLoansPage({ user }: MyLoansPageProps) {
    const [activeTab, setActiveTab] = useState('my-requests');

    const {
        myRequests,
        receivedRequests,
        loading: requestsLoading,
        error: requestsError,
        refetchAll: refetchRequests
    } = useLoanRequests();

    const {
        myLoans,
        lentItems,
        overdueLoans,
        loading: loansLoading,
        error: loansError,
        refetchAll: refetchLoans
    } = useLoans();

    const {
        acceptLoanRequest,
        rejectLoanRequest,
        cancelLoanRequest,
        acceptLoading,
        rejectLoading,
        cancelLoading
    } = useLoanRequestActions();

    const { returnLoan, loading: returnLoading } = useReturnLoan();

    useEffect(() => {
        refetchRequests();
        refetchLoans();
    }, []);

    const handleAcceptRequest = async (id: number) => {
        const success = await acceptLoanRequest(id, user.id);
        if (success) {
            refetchRequests();
            refetchLoans();
        }
    };

    const handleRejectRequest = async (id: number) => {
        const success = await rejectLoanRequest(id, user.id);
        if (success) {
            refetchRequests();
        }
    };

    const handleCancelRequest = async (id: number) => {
        const success = await cancelLoanRequest(id, user.id);
        if (success) {
            refetchRequests();
        }
    };

    const handleReturnLoan = async (id: number) => {
        const success = await returnLoan(id, user.id);
        if (success) {
            refetchLoans();
        }
    };

    const getRequestStats = () => {
        const pendingReceived = receivedRequests.filter(r => r.status === LoanRequestStatus.PENDING).length;
        const pendingMy = myRequests.filter(r => r.status === LoanRequestStatus.PENDING).length;
        
        return {
            pendingReceived,
            pendingMy,
            totalReceived: receivedRequests.length,
            totalMy: myRequests.length
        };
    };

    const getLoanStats = () => {
        const activeLoans = myLoans.filter(l => l.status === LoanStatus.ACTIVE).length;
        const activeLentItems = lentItems.filter(l => l.status === LoanStatus.ACTIVE).length;
        
        return {
            activeLoans,
            activeLentItems,
            overdueCount: overdueLoans.length,
            totalLoans: myLoans.length,
            totalLentItems: lentItems.length
        };
    };

    const stats = getRequestStats();
    const loanStats = getLoanStats();

    const renderEmptyState = (type: string) => {
        const emptyStates = {
            'my-requests': {
                icon: 'send',
                title: 'Aucune demande envoyée',
                description: 'Vous n\'avez encore envoyé aucune demande d\'emprunt. Explorez les objets de vos voisins !'
            },
            'received-requests': {
                icon: 'inbox',
                title: 'Aucune demande reçue',
                description: 'Vous n\'avez reçu aucune demande pour vos objets. Partagez plus d\'objets pour augmenter vos chances !'
            },
            'my-loans': {
                icon: 'inventory_2',
                title: 'Aucun emprunt',
                description: 'Vous n\'avez actuellement aucun objet emprunté.'
            },
            'lent-items': {
                icon: 'handshake',
                title: 'Aucun objet prêté',
                description: 'Vous n\'avez actuellement aucun objet en cours de prêt.'
            }
        };

        const state = emptyStates[type] || emptyStates['my-requests'];

        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl text-gray-400">
                        {state.icon}
                    </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {state.title}
                </h3>
                <p className="text-gray-600">
                    {state.description}
                </p>
            </div>
        );
    };

    const renderLoadingState = () => (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <div className="flex justify-between">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-8 w-full" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    return (
        <div>
            <DashboardHeader />
            
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Mes prêts et emprunts
                        </h1>
                        <p className="text-gray-600">
                            Gérez vos demandes d'emprunt et suivez vos prêts en cours
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-blue-600">
                                            send
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Demandes envoyées</p>
                                        <p className="text-lg font-semibold">
                                            {stats.totalMy}
                                            {stats.pendingMy > 0 && (
                                                <Badge variant="outline" className="ml-2 text-xs">
                                                    {stats.pendingMy} en attente
                                                </Badge>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-green-600">
                                            inbox
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Demandes reçues</p>
                                        <p className="text-lg font-semibold">
                                            {stats.totalReceived}
                                            {stats.pendingReceived > 0 && (
                                                <Badge variant="default" className="ml-2 text-xs">
                                                    {stats.pendingReceived} à traiter
                                                </Badge>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-purple-600">
                                            inventory_2
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Mes emprunts</p>
                                        <p className="text-lg font-semibold">
                                            {loanStats.totalLoans}
                                            {loanStats.activeLoans > 0 && (
                                                <Badge variant="outline" className="ml-2 text-xs">
                                                    {loanStats.activeLoans} actif{loanStats.activeLoans > 1 ? 's' : ''}
                                                </Badge>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-orange-600">
                                            handshake
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Mes prêts</p>
                                        <p className="text-lg font-semibold">
                                            {loanStats.totalLentItems}
                                            {loanStats.activeLentItems > 0 && (
                                                <Badge variant="outline" className="ml-2 text-xs">
                                                    {loanStats.activeLentItems} actif{loanStats.activeLentItems > 1 ? 's' : ''}
                                                </Badge>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Overdue alert */}
                    {loanStats.overdueCount > 0 && (
                        <Alert variant="destructive" className="mb-6">
                            <span className="material-symbols-outlined">warning</span>
                            <AlertDescription>
                                Vous avez {loanStats.overdueCount} prêt{loanStats.overdueCount > 1 ? 's' : ''} en retard. 
                                Veuillez les retourner rapidement.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="my-requests" className="relative">
                                Mes demandes
                                {stats.pendingMy > 0 && (
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                        {stats.pendingMy}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="received-requests" className="relative">
                                Demandes reçues
                                {stats.pendingReceived > 0 && (
                                    <Badge variant="default" className="ml-2 text-xs">
                                        {stats.pendingReceived}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="my-loans">
                                Mes emprunts
                            </TabsTrigger>
                            <TabsTrigger value="lent-items">
                                Mes prêts
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="my-requests" className="mt-6">
                            {requestsError && (
                                <Alert variant="destructive" className="mb-6">
                                    <AlertDescription>{requestsError}</AlertDescription>
                                </Alert>
                            )}
                            
                            {requestsLoading ? renderLoadingState() : (
                                myRequests.length > 0 ? (
                                    <div className="space-y-4">
                                        {myRequests.map((request) => (
                                            <LoanRequestCard
                                                key={request.id}
                                                loanRequest={request}
                                                currentUserId={user.id}
                                                onCancel={handleCancelRequest}
                                                cancelLoading={cancelLoading}
                                            />
                                        ))}
                                    </div>
                                ) : renderEmptyState('my-requests')
                            )}
                        </TabsContent>

                        <TabsContent value="received-requests" className="mt-6">
                            {requestsError && (
                                <Alert variant="destructive" className="mb-6">
                                    <AlertDescription>{requestsError}</AlertDescription>
                                </Alert>
                            )}
                            
                            {requestsLoading ? renderLoadingState() : (
                                receivedRequests.length > 0 ? (
                                    <div className="space-y-4">
                                        {receivedRequests.map((request) => (
                                            <LoanRequestCard
                                                key={request.id}
                                                loanRequest={request}
                                                currentUserId={user.id}
                                                onAccept={handleAcceptRequest}
                                                onReject={handleRejectRequest}
                                                acceptLoading={acceptLoading}
                                                rejectLoading={rejectLoading}
                                            />
                                        ))}
                                    </div>
                                ) : renderEmptyState('received-requests')
                            )}
                        </TabsContent>

                        <TabsContent value="my-loans" className="mt-6">
                            {loansError && (
                                <Alert variant="destructive" className="mb-6">
                                    <AlertDescription>{loansError}</AlertDescription>
                                </Alert>
                            )}
                            
                            {loansLoading ? renderLoadingState() : (
                                myLoans.length > 0 ? (
                                    <div className="space-y-4">
                                        {myLoans.map((loan) => (
                                            <LoanCard
                                                key={loan.id}
                                                loan={loan}
                                                currentUserId={user.id}
                                                onReturn={handleReturnLoan}
                                                returnLoading={returnLoading}
                                            />
                                        ))}
                                    </div>
                                ) : renderEmptyState('my-loans')
                            )}
                        </TabsContent>

                        <TabsContent value="lent-items" className="mt-6">
                            {loansError && (
                                <Alert variant="destructive" className="mb-6">
                                    <AlertDescription>{loansError}</AlertDescription>
                                </Alert>
                            )}
                            
                            {loansLoading ? renderLoadingState() : (
                                lentItems.length > 0 ? (
                                    <div className="space-y-4">
                                        {lentItems.map((loan) => (
                                            <LoanCard
                                                key={loan.id}
                                                loan={loan}
                                                currentUserId={user.id}
                                                onReturn={handleReturnLoan}
                                                returnLoading={returnLoading}
                                            />
                                        ))}
                                    </div>
                                ) : renderEmptyState('lent-items')
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

export default withNeighborhoodLayout(MyLoansPage);