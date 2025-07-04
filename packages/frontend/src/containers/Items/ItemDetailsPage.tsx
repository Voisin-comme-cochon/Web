import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserModel } from '@/domain/models/user.model';
import { HomeUc } from '@/domain/use-cases/homeUc';
import { ItemsUc } from '@/domain/use-cases/itemsUc';
import { ItemRepository } from '@/infrastructure/repositories/ItemRepository';
import { useItem } from '@/presentation/hooks/useItems';
import { useCreateLoanRequest } from '@/presentation/hooks/useLoanRequests';
import { useAppNavigation } from '@/presentation/state/navigate';
import DashboardHeader from '@/components/Header/DashboardHeader';
import LoanRequestForm from '@/components/LoanRequestForm/LoanRequestForm';
import AvailabilityManager from '@/components/AvailabilityManager/AvailabilityManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { withNeighborhoodLayout } from '@/containers/Wrapper/NeighborhoodWrapper';
import { CreateLoanRequestRequest } from '@/domain/models/loan-request.model';
import { ItemAvailabilityStatus } from '@/domain/models/item.model';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ItemDetailsPageProps {
    user: UserModel;
    neighborhoodId: string;
    uc: HomeUc;
}

function ItemDetailsPage({ user, neighborhoodId }: ItemDetailsPageProps) {
    const { itemId } = useParams<{ itemId: string }>();
    const { goItems, goEditItem } = useAppNavigation();
    const [showLoanRequestForm, setShowLoanRequestForm] = useState(false);

    const { item, loading, error, refetch } = useItem(itemId ? parseInt(itemId) : undefined);
    const { createLoanRequest, loading: loanRequestLoading, error: loanRequestError } = useCreateLoanRequest();

    const itemsUc = new ItemsUc(new ItemRepository());

    useEffect(() => {
        if (!itemId) {
            goItems();
        }
    }, [itemId, goItems]);

    const handleLoanRequestSubmit = async (data: CreateLoanRequestRequest) => {
        const result = await createLoanRequest(data);
        if (result) {
            setShowLoanRequestForm(false);
            refetch();
        }
    };

    const getItemStatus = () => {
        if (!item?.availabilities || item.availabilities.length === 0) {
            return { status: 'Pas de disponibilité', color: 'bg-gray-100 text-gray-800', description: 'Aucune période de disponibilité définie.' };
        }

        const now = new Date();
        const activeAvailabilities = item.availabilities.filter(
            a => a.start_date <= now && a.end_date >= now
        );

        if (activeAvailabilities.length === 0) {
            return { 
                status: 'Non disponible', 
                color: 'bg-red-100 text-red-800',
                description: 'Aucune disponibilité active pour le moment.'
            };
        }

        const availableCount = activeAvailabilities.filter(
            a => a.status === ItemAvailabilityStatus.AVAILABLE
        ).length;

        if (availableCount === activeAvailabilities.length) {
            return { 
                status: 'Disponible', 
                color: 'bg-green-100 text-green-800',
                description: 'Cet objet est actuellement disponible à l\'emprunt.'
            };
        } else if (availableCount > 0) {
            return { 
                status: 'Partiellement disponible', 
                color: 'bg-yellow-100 text-yellow-800',
                description: 'Cet objet est partiellement disponible.'
            };
        } else {
            return { 
                status: 'Occupé', 
                color: 'bg-orange-100 text-orange-800',
                description: 'Cet objet est actuellement en cours d\'emprunt.'
            };
        }
    };

    if (loading) {
        return (
            <div>
                <DashboardHeader />
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <Skeleton className="aspect-square rounded-lg" />
                                <div className="grid grid-cols-2 gap-2">
                                    <Skeleton className="aspect-square rounded-lg" />
                                    <Skeleton className="aspect-square rounded-lg" />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <Skeleton className="h-8 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div>
                <DashboardHeader />
                <div className="container mx-auto px-4 py-8">
                    <Alert variant="destructive">
                        <AlertDescription>
                            {error || 'Objet non trouvé'}
                        </AlertDescription>
                    </Alert>
                    <Button onClick={goItems} className="mt-4">
                        <span className="material-symbols-outlined text-sm mr-2">arrow_back</span>
                        Retour à la liste
                    </Button>
                </div>
            </div>
        );
    }

    const isOwner = user.id === item.owner_id;
    const { canBorrow, reason } = itemsUc.canBorrowItem(item, user.id);
    const { status, color, description } = getItemStatus();

    return (
        <div>
            <DashboardHeader />
            
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Back button */}
                    <Button
                        variant="ghost"
                        onClick={goItems}
                        className="mb-6"
                    >
                        <span className="material-symbols-outlined text-sm mr-2">arrow_back</span>
                        Retour à la liste
                    </Button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Image section */}
                        <div className="space-y-4">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-6xl text-gray-400">
                                            inventory_2
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info section */}
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {item.name}
                                    </h1>
                                    {isOwner && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => goEditItem(item.id)}
                                        >
                                            <span className="material-symbols-outlined text-sm mr-2">edit</span>
                                            Modifier
                                        </Button>
                                    )}
                                </div>

                                {item.category && (
                                    <Badge variant="secondary" className="mb-4">
                                        {item.category}
                                    </Badge>
                                )}

                                <div className="flex items-center gap-2 mb-4">
                                    <Badge className={color}>
                                        {status}
                                    </Badge>
                                    <span className="text-sm text-gray-600">{description}</span>
                                </div>
                            </div>

                            {/* Owner info */}
                            {item.owner && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg">Propriétaire</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-3">
                                            {item.owner.profileImageUrl ? (
                                                <img
                                                    src={item.owner.profileImageUrl}
                                                    alt={`${item.owner.firstName} ${item.owner.lastName}`}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-gray-600">
                                                        person
                                                    </span>
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium">
                                                    {item.owner.firstName} {item.owner.lastName}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Membre du quartier
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Description */}
                            {item.description && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg">Description</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 whitespace-pre-wrap">
                                            {item.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Availabilities */}
                            {item.availabilities && item.availabilities.length > 0 && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg">Disponibilités</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {item.availabilities.map((availability) => (
                                                <div
                                                    key={availability.id}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-sm text-gray-600">
                                                            calendar_today
                                                        </span>
                                                        <span className="text-sm">
                                                            Du {format(new Date(availability.start_date), 'dd MMM', { locale: fr })} au{' '}
                                                            {format(new Date(availability.end_date), 'dd MMM yyyy', { locale: fr })}
                                                        </span>
                                                    </div>
                                                    <Badge
                                                        variant={availability.status === ItemAvailabilityStatus.AVAILABLE ? 'default' : 'secondary'}
                                                        className="text-xs"
                                                    >
                                                        {availability.status === ItemAvailabilityStatus.AVAILABLE ? 'Libre' : 
                                                         availability.status === ItemAvailabilityStatus.OCCUPIED ? 'Occupé' : 'Partiel'}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Availability Management for owners */}
                            {isOwner && (
                                <AvailabilityManager
                                    item={item}
                                    currentUserId={user.id}
                                />
                            )}

                            {/* Action buttons */}
                            <div className="space-y-4">
                                {isOwner ? (
                                    <Alert>
                                        <AlertDescription>
                                            Ceci est votre objet. Vous pouvez le modifier ou gérer ses disponibilités ci-dessus.
                                        </AlertDescription>
                                    </Alert>
                                ) : canBorrow ? (
                                    <Dialog open={showLoanRequestForm} onOpenChange={setShowLoanRequestForm}>
                                        <DialogTrigger asChild>
                                            <Button size="lg" className="w-full">
                                                <span className="material-symbols-outlined text-sm mr-2">
                                                    send
                                                </span>
                                                Demander à emprunter
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>Demande d'emprunt</DialogTitle>
                                            </DialogHeader>
                                            <LoanRequestForm
                                                item={item}
                                                onSubmit={handleLoanRequestSubmit}
                                                loading={loanRequestLoading}
                                                error={loanRequestError}
                                                onCancel={() => setShowLoanRequestForm(false)}
                                            />
                                        </DialogContent>
                                    </Dialog>
                                ) : (
                                    <Alert variant="destructive">
                                        <AlertDescription>
                                            {reason}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            {/* Creation date */}
                            <div className="text-sm text-gray-500">
                                Objet ajouté le {format(new Date(item.created_at), 'dd MMMM yyyy', { locale: fr })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withNeighborhoodLayout(ItemDetailsPage);