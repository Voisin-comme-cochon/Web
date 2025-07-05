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
import ItemCard from '@/components/ItemCard/ItemCard';
import FilterBar from '@/components/FilterBar/FilterBar';
import LoanRequestCard from '@/components/LoanRequestCard/LoanRequestCard';
import LoanCard from '@/components/LoanCard/LoanCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

    const renderPagination = () => {
        if (pagination.totalPages <= 1) return null;

        const getVisiblePages = () => {
            const totalPages = pagination.totalPages;
            const currentPage = pagination.page;
            const maxVisiblePages = 5;

            if (totalPages <= maxVisiblePages) {
                return Array.from({ length: totalPages }, (_, i) => i + 1);
            }

            const start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            const end = Math.min(totalPages, start + maxVisiblePages - 1);
            const adjustedStart = Math.max(1, end - maxVisiblePages + 1);

            return Array.from({ length: end - adjustedStart + 1 }, (_, i) => adjustedStart + i);
        };

        const visiblePages = getVisiblePages();

        return (
            <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading}
                >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                </Button>

                {pagination.page > 3 && pagination.totalPages > 5 && (
                    <>
                        <Button variant="outline" size="sm" onClick={() => handlePageChange(1)} disabled={loading}>
                            1
                        </Button>
                        {pagination.page > 4 && <span className="text-gray-400">...</span>}
                    </>
                )}

                {visiblePages.map((page) => (
                    <Button
                        key={page}
                        variant={page === pagination.page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        disabled={loading}
                    >
                        {page}
                    </Button>
                ))}

                {pagination.page < pagination.totalPages - 2 && pagination.totalPages > 5 && (
                    <>
                        {pagination.page < pagination.totalPages - 3 && <span className="text-gray-400">...</span>}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.totalPages)}
                            disabled={loading}
                        >
                            {pagination.totalPages}
                        </Button>
                    </>
                )}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages || loading}
                >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                </Button>
            </div>
        );
    };

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
                            {loanStats.activeLoans > 0 && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                    {loanStats.activeLoans}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="lent-items">
                            Mes prêts
                            {loanStats.activeLentItems > 0 && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                    {loanStats.activeLentItems}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="items" className="mt-6">
                        {/* Filters */}
                        <div key={`filter-${filters.neighborhoodId}`}>
                            <FilterBar
                                searchTerm={filters.search || ''}
                                onSearchChange={handleSearchChange}
                                selectedCategory={filters.category || 'all'}
                                onCategoryChange={handleCategoryChange}
                                selectedStatus={filters.status || 'all'}
                                onStatusChange={handleStatusChange}
                                onClearFilters={handleClearFilters}
                                loading={loading}
                            />
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mt-6 mb-6">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="material-symbols-outlined text-sm">inventory_2</span>
                                <span>
                                    {pagination.total} objet{pagination.total > 1 ? 's' : ''} trouvé
                                    {pagination.total > 1 ? 's' : ''}
                                </span>
                            </div>

                            {pagination.totalPages > 1 && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className="material-symbols-outlined text-sm">auto_stories</span>
                                    <span>
                                        Page {pagination.page} sur {pagination.totalPages}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        {error && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="space-y-3">
                                        <Skeleton className="aspect-square rounded-lg" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                        <Skeleton className="h-8 w-full" />
                                    </div>
                                ))}
                            </div>
                        ) : items.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {items.map((item) => (
                                        <ItemCard key={item.id} item={item} currentUserId={user.id} />
                                    ))}
                                </div>

                                {renderPagination()}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-4xl text-gray-400">
                                        inventory_2
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun objet trouvé</h3>
                                <p className="text-gray-600 mb-6">
                                    {filters.search || (filters.category && filters.category !== '') || filters.status
                                        ? 'Aucun objet ne correspond à vos critères de recherche.'
                                        : 'Soyez le premier à partager un objet dans votre quartier !'}
                                </p>

                                {filters.search || (filters.category && filters.category !== '') || filters.status ? (
                                    <Button variant="outline" onClick={handleClearFilters}>
                                        <span className="material-symbols-outlined text-sm mr-2">clear_all</span>
                                        Effacer les filtres
                                    </Button>
                                ) : (
                                    <Button onClick={goAddItem}>
                                        <span className="material-symbols-outlined text-sm mr-2">add</span>
                                        Ajouter le premier objet
                                    </Button>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    {/* Mes demandes */}
                    <TabsContent value="my-requests" className="mt-6">
                        {requestsError && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertDescription>{requestsError}</AlertDescription>
                            </Alert>
                        )}

                        {requestsLoading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-32 w-full" />
                                ))}
                            </div>
                        ) : myRequests.length > 0 ? (
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
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl text-gray-400">send</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune demande envoyée</h3>
                                <p className="text-gray-600">Vous n'avez encore envoyé aucune demande d'emprunt.</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Demandes reçues */}
                    <TabsContent value="received-requests" className="mt-6">
                        {requestsError && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertDescription>{requestsError}</AlertDescription>
                            </Alert>
                        )}

                        {requestsLoading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-32 w-full" />
                                ))}
                            </div>
                        ) : receivedRequests.length > 0 ? (
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
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl text-gray-400">inbox</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune demande reçue</h3>
                                <p className="text-gray-600">Vous n'avez reçu aucune demande pour vos objets.</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Mes emprunts */}
                    <TabsContent value="my-loans" className="mt-6">
                        {loansError && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertDescription>{loansError}</AlertDescription>
                            </Alert>
                        )}

                        {loansLoading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-32 w-full" />
                                ))}
                            </div>
                        ) : myLoans.length > 0 ? (
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
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl text-gray-400">
                                        inventory_2
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun emprunt</h3>
                                <p className="text-gray-600">Vous n'avez actuellement aucun objet emprunté.</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Mes prêts */}
                    <TabsContent value="lent-items" className="mt-6">
                        {loansError && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertDescription>{loansError}</AlertDescription>
                            </Alert>
                        )}

                        {loansLoading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-32 w-full" />
                                ))}
                            </div>
                        ) : lentItems.length > 0 ? (
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
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl text-gray-400">handshake</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun objet prêté</h3>
                                <p className="text-gray-600">Vous n'avez actuellement aucun objet en cours de prêt.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

export default withNeighborhoodLayout(ItemsPage);
