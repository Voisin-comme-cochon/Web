import { useCallback } from 'react';
import { UserModel } from '@/domain/models/user.model';
import { GetItemsFilters, ItemAvailabilityStatus } from '@/domain/models/item.model';
import { useAppNavigation } from '@/presentation/state/navigate';
import ItemCard from '@/components/Items/ItemCard/ItemCard';
import FilterBar from '@/components/Items/ItemFilter/FilterBar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AvailableItemsTabProps {
    user: UserModel;
    items: any[];
    loading: boolean;
    error: string | null;
    pagination: any;
    filters: GetItemsFilters;
    onSearchChange: (search: string) => void;
    onCategoryChange: (category: string) => void;
    onStatusChange: (status: string) => void;
    onClearFilters: () => void;
    onPageChange: (page: number) => void;
}

export default function AvailableItemsTab({
    user,
    items,
    loading,
    error,
    pagination,
    filters,
    onSearchChange,
    onCategoryChange,
    onStatusChange,
    onClearFilters,
    onPageChange
}: AvailableItemsTabProps) {
    const { goAddItem } = useAppNavigation();

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
                    onClick={() => onPageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading}
                >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                </Button>

                {pagination.page > 3 && pagination.totalPages > 5 && (
                    <>
                        <Button variant="outline" size="sm" onClick={() => onPageChange(1)} disabled={loading}>
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
                        onClick={() => onPageChange(page)}
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
                            onClick={() => onPageChange(pagination.totalPages)}
                            disabled={loading}
                        >
                            {pagination.totalPages}
                        </Button>
                    </>
                )}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages || loading}
                >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                </Button>
            </div>
        );
    };

    return (
        <>
            {/* Filters */}
            <div key={`filter-${filters.neighborhoodId}`}>
                <FilterBar
                    searchTerm={filters.search || ''}
                    onSearchChange={onSearchChange}
                    selectedCategory={filters.category || 'all'}
                    onCategoryChange={onCategoryChange}
                    selectedStatus={filters.status || 'all'}
                    onStatusChange={onStatusChange}
                    onClearFilters={onClearFilters}
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
                        <Button variant="outline" onClick={onClearFilters}>
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
        </>
    );
}