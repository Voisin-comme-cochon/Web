import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserModel } from '@/domain/models/user.model';
import { HomeUc } from '@/domain/use-cases/homeUc';
import { CreateItemRequest, UpdateItemRequest } from '@/domain/models/item.model';
import { useItem, useUpdateItem, useDeleteItem } from '@/presentation/hooks/useItems';
import { useAppNavigation } from '@/presentation/state/navigate';
import DashboardHeader from '@/components/Header/DashboardHeader';
import ItemForm from '@/components/ItemForm/ItemForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { withNeighborhoodLayout } from '@/containers/Wrapper/NeighborhoodWrapper';

interface EditItemPageProps {
    user: UserModel;
    neighborhoodId: string;
    uc: HomeUc;
}

function EditItemPage({ user, neighborhoodId }: EditItemPageProps) {
    const { itemId } = useParams<{ itemId: string }>();
    const { goItems, goItemDetails } = useAppNavigation();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const { item, loading: itemLoading, error: itemError, refetch } = useItem(itemId ? parseInt(itemId) : undefined);
    const { updateItem, loading: updateLoading, error: updateError } = useUpdateItem();
    const { deleteItem, loading: deleteLoading, error: deleteError } = useDeleteItem();

    useEffect(() => {
        if (!itemId) {
            goItems();
            return;
        }
    }, [itemId, goItems]);

    useEffect(() => {
        if (item && item.owner_id !== user.id) {
            goItemDetails(item.id);
        }
    }, [item, user.id, goItemDetails]);

    const handleSubmit = async (data: CreateItemRequest | UpdateItemRequest) => {
        if (!itemId) return;
        
        // Filtrer les champs non autorisés pour les updates
        const updateData: UpdateItemRequest = {
            name: data.name,
            description: data.description,
            category: data.category,
            image: data.image
        };
        
        const success = await updateItem(parseInt(itemId), updateData);
        if (success) {
            goItemDetails(parseInt(itemId));
        }
    };

    const handleDelete = async () => {
        if (!itemId) return;
        
        const success = await deleteItem(parseInt(itemId));
        if (success) {
            goItems();
        }
    };

    if (itemLoading) {
        return (
            <div>
                <DashboardHeader />
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-2xl mx-auto">
                        <Skeleton className="h-8 w-1/3 mb-6" />
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-1/2" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-32 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (itemError || !item) {
        return (
            <div>
                <DashboardHeader />
                <div className="container mx-auto px-4 py-8">
                    <Alert variant="destructive">
                        <AlertDescription>
                            {itemError || 'Objet non trouvé'}
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

    if (item.owner_id !== user.id) {
        return (
            <div>
                <DashboardHeader />
                <div className="container mx-auto px-4 py-8">
                    <Alert variant="destructive">
                        <AlertDescription>
                            Vous ne pouvez modifier que vos propres objets.
                        </AlertDescription>
                    </Alert>
                    <Button onClick={() => goItemDetails(item.id)} className="mt-4">
                        <span className="material-symbols-outlined text-sm mr-2">arrow_back</span>
                        Retour à l'objet
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <DashboardHeader />
            
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    {/* Back button */}
                    <Button
                        variant="ghost"
                        onClick={() => goItemDetails(item.id)}
                        className="mb-6"
                    >
                        <span className="material-symbols-outlined text-sm mr-2">arrow_back</span>
                        Retour à l'objet
                    </Button>

                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Modifier : {item.name}
                            </h1>
                            <p className="text-gray-600">
                                Modifiez les informations de votre objet partagé.
                            </p>
                        </div>

                        {/* Delete button */}
                        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                            <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <span className="material-symbols-outlined text-sm mr-2">delete</span>
                                    Supprimer
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Supprimer l'objet</DialogTitle>
                                    <DialogDescription>
                                        Êtes-vous sûr de vouloir supprimer définitivement cet objet ? 
                                        Cette action ne peut pas être annulée.
                                    </DialogDescription>
                                </DialogHeader>
                                {deleteError && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{deleteError}</AlertDescription>
                                    </Alert>
                                )}
                                <DialogFooter>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setShowDeleteDialog(false)}
                                        disabled={deleteLoading}
                                    >
                                        Annuler
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        onClick={handleDelete}
                                        disabled={deleteLoading}
                                    >
                                        {deleteLoading ? (
                                            <>
                                                <span className="material-symbols-outlined animate-spin text-sm mr-2">
                                                    refresh
                                                </span>
                                                Suppression...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-sm mr-2">delete</span>
                                                Supprimer définitivement
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Form */}
                    <ItemForm
                        onSubmit={handleSubmit}
                        loading={updateLoading}
                        error={updateError}
                        isEditing={true}
                        initialData={{
                            name: item.name,
                            description: item.description,
                            category: item.category,
                            image_url: item.image_url,
                            neighborhood_id: parseInt(neighborhoodId)
                        }}
                    />

                    {/* Info */}
                    <Alert className="mt-6">
                        <span className="material-symbols-outlined text-sm">
                            info
                        </span>
                        <AlertDescription>
                            Les modifications seront visibles immédiatement pour tous les membres du quartier. 
                            Vous pouvez également gérer les disponibilités depuis la page de détail de l'objet.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        </div>
    );
}

export default withNeighborhoodLayout(EditItemPage);