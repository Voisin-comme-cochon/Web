import { useState, useEffect, useCallback } from 'react';
import { UserModel } from '@/domain/models/user.model';
import { HomeUc } from '@/domain/use-cases/homeUc';
import { GetItemsFilters, ItemAvailabilityStatus } from '@/domain/models/item.model';
import { useItems } from '@/presentation/hooks/useItems';
import { useLoanRequests } from '@/presentation/hooks/useLoanRequests';
import { useLoans } from '@/presentation/hooks/useLoans';
import { useLoanRequestActions } from '@/presentation/hooks/useLoanRequests';
import { useReturnLoan } from '@/presentation/hooks/useLoans';
import { useAppNavigation } from '@/presentation/state/navigate';
import DashboardHeader from '@/components/Header/DashboardHeader';
import AvailableItemsTab from '@/components/Items/Tabs/AvailableItemsTab';
import MyRequestsTab from '@/components/Items/Tabs/MyRequestsTab';
import ReceivedRequestsTab from '@/components/Items/Tabs/ReceivedRequestsTab';
import MyLoansTab from '@/components/Items/Tabs/MyLoansTab';
import LentItemsTab from '@/components/Items/Tabs/LentItemsTab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { withNeighborhoodLayout } from '@/containers/Wrapper/NeighborhoodWrapper';
import { LoanRequestStatus } from '@/domain/models/loan-request.model';
import { LoanStatus } from '@/domain/models/loan.model';

interface ItemsPageProps {
    user: UserModel;
    neighborhoodId: string;
    uc: HomeUc;
}

function ItemsPage({ user, neighborhoodId }: ItemsPageProps) {
    const { goAddItem } = useAppNavigation();
    const [activeTab, setActiveTab] = useState('items');

    const [filters, setFilters] = useState<GetItemsFilters>({
        neighborhoodId: parseInt(neighborhoodId),
        category: '',
        search: '',
        status: undefined,
        page: 1,
        limit: 12,
    });

    const {
        myRequests,
        receivedRequests,
        loading: requestsLoading,
        error: requestsError,
        refetchAll: refetchRequests,
    } = useLoanRequests();

    const { myLoans, lentItems, loading: loansLoading, error: loansError, refetchAll: refetchLoans } = useLoans();

    const { acceptLoanRequest, rejectLoanRequest, cancelLoanRequest, acceptLoading, rejectLoading, cancelLoading } =
        useLoanRequestActions();

    const { returnLoan, loading: returnLoading } = useReturnLoan();

    const { items, loading, error, pagination, fetchItems } = useItems();

    const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 300);

        return () => clearTimeout(timer);
    }, [filters.search]);

    useEffect(() => {
        const finalFilters = {
            ...filters,
            search: debouncedSearch,
        };
        fetchItems(finalFilters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.neighborhoodId, filters.category, filters.status, filters.page, filters.limit, debouncedSearch]);

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

    const handleSearchChange = useCallback((search: string) => {
        setFilters((prev) => ({ ...prev, search, page: 1 }));
    }, []);

    const handleCategoryChange = useCallback((category: string) => {
        setFilters((prev) => ({ ...prev, category: category === 'all' ? '' : category, page: 1 }));
    }, []);

    const handleStatusChange = useCallback((status: string) => {
        setFilters((prev) => ({
            ...prev,
            status: status === 'all' ? undefined : (status as ItemAvailabilityStatus),
            page: 1,
        }));
    }, []);

    const handleClearFilters = useCallback(() => {
        setFilters((prev) => ({
            ...prev,
            search: '',
            category: '',
            status: undefined,
            page: 1,
        }));
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setFilters((prev) => ({ ...prev, page }));
    }, []);

    const getRequestStats = () => {
        const pendingReceived = receivedRequests.filter((r) => r.status === LoanRequestStatus.PENDING).length;
        const pendingMy = myRequests.filter((r) => r.status === LoanRequestStatus.PENDING).length;

        return { pendingReceived, pendingMy };
    };

    const getLoanStats = () => {
        const activeLoans = myLoans.filter((l) => l.status === LoanStatus.ACTIVE).length;
        const activeLentItems = lentItems.filter((l) => l.status === LoanStatus.ACTIVE).length;

        return { activeLoans, activeLentItems };
    };

    const stats = getRequestStats();
    const loanStats = getLoanStats();

    return (
        <div>
            <DashboardHeader />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Matériel du quartier</h1>
                        <p className="text-gray-600 mt-2">Découvrez, empruntez et gérez les objets partagés</p>
                    </div>

                    <Button variant={'orange'} onClick={goAddItem}>
                        <span className="material-symbols-outlined text-sm mr-2">add</span>
                        Partager un objet
                    </Button>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="items">Objets disponibles</TabsTrigger>
                        <TabsTrigger value="my-requests" className="relative">
                            Mes demandes
                            {stats.pendingMy > 0 && (
                                <Badge hover={false} variant="secondary" className="ml-2 text-xs">
                                    {stats.pendingMy}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="received-requests" className="relative">
                            Demandes reçues
                            {stats.pendingReceived > 0 && (
                                <Badge hover={false} variant="default" className="ml-2 text-xs">
                                    {stats.pendingReceived}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="my-loans">
                            Mes emprunts
                            {loanStats.activeLoans > 0 && (
                                <Badge hover={false} variant="outline" className="ml-2 text-xs">
                                    {loanStats.activeLoans}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="lent-items">
                            Mes prêts
                            {loanStats.activeLentItems > 0 && (
                                <Badge hover={false} variant="outline" className="ml-2 text-xs">
                                    {loanStats.activeLentItems}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="items" className="mt-6">
                        <AvailableItemsTab
                            user={user}
                            items={items}
                            loading={loading}
                            error={error}
                            pagination={pagination}
                            filters={filters}
                            onSearchChange={handleSearchChange}
                            onCategoryChange={handleCategoryChange}
                            onStatusChange={handleStatusChange}
                            onClearFilters={handleClearFilters}
                            onPageChange={handlePageChange}
                        />
                    </TabsContent>

                    <TabsContent value="my-requests" className="mt-6">
                        <MyRequestsTab
                            user={user}
                            myRequests={myRequests}
                            loading={requestsLoading}
                            error={requestsError}
                            onCancel={handleCancelRequest}
                            cancelLoading={cancelLoading}
                        />
                    </TabsContent>

                    <TabsContent value="received-requests" className="mt-6">
                        <ReceivedRequestsTab
                            user={user}
                            receivedRequests={receivedRequests}
                            loading={requestsLoading}
                            error={requestsError}
                            onAccept={handleAcceptRequest}
                            onReject={handleRejectRequest}
                            acceptLoading={acceptLoading}
                            rejectLoading={rejectLoading}
                        />
                    </TabsContent>

                    <TabsContent value="my-loans" className="mt-6">
                        <MyLoansTab
                            user={user}
                            myLoans={myLoans}
                            loading={loansLoading}
                            error={loansError}
                            onReturn={handleReturnLoan}
                            returnLoading={returnLoading}
                        />
                    </TabsContent>

                    <TabsContent value="lent-items" className="mt-6">
                        <LentItemsTab
                            user={user}
                            lentItems={lentItems}
                            loading={loansLoading}
                            error={loansError}
                            onReturn={handleReturnLoan}
                            returnLoading={returnLoading}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

export default withNeighborhoodLayout(ItemsPage);