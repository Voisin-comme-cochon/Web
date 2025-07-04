import { useState } from 'react';
import { UserModel } from '@/domain/models/user.model';
import { HomeUc } from '@/domain/use-cases/homeUc';
import { CreateItemRequest } from '@/domain/models/item.model';
import { useCreateItem } from '@/presentation/hooks/useItems';
import { useAppNavigation } from '@/presentation/state/navigate';
import DashboardHeader from '@/components/Header/DashboardHeader';
import ItemForm from '@/components/ItemForm/ItemForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { withNeighborhoodLayout } from '@/containers/Wrapper/NeighborhoodWrapper';

interface AddItemPageProps {
    user: UserModel;
    neighborhoodId: string;
    uc: HomeUc;
}

function AddItemPage({ user, neighborhoodId }: AddItemPageProps) {
    const { goItems, goItemDetails } = useAppNavigation();
    const { createItem, loading, error } = useCreateItem();

    const handleSubmit = async (data: CreateItemRequest) => {
        const itemData = {
            ...data,
            neighborhood_id: parseInt(neighborhoodId)
        };

        const result = await createItem(itemData);
        if (result) {
            goItemDetails(result.id);
        }
    };

    return (
        <div>
            <DashboardHeader />
            
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    {/* Back button */}
                    <Button
                        variant="ghost"
                        onClick={goItems}
                        className="mb-6"
                    >
                        <span className="material-symbols-outlined text-sm mr-2">arrow_back</span>
                        Retour à la liste
                    </Button>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Ajouter un objet
                        </h1>
                        <p className="text-gray-600">
                            Partagez un objet avec vos voisins et participez à l'économie collaborative de votre quartier.
                        </p>
                    </div>

                    {/* Tips */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-orange">
                                    lightbulb
                                </span>
                                Conseils pour un bon partage
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-xs text-green-600 mt-0.5">
                                        check_circle
                                    </span>
                                    <span>Ajoutez une photo claire de votre objet</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-xs text-green-600 mt-0.5">
                                        check_circle
                                    </span>
                                    <span>Décrivez l'état et les caractéristiques importantes</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-xs text-green-600 mt-0.5">
                                        check_circle
                                    </span>
                                    <span>Choisissez une catégorie appropriée pour faciliter la recherche</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-xs text-green-600 mt-0.5">
                                        check_circle
                                    </span>
                                    <span>Vous pourrez définir les disponibilités après la création</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Form */}
                    <ItemForm
                        onSubmit={handleSubmit}
                        loading={loading}
                        error={error}
                        initialData={{
                            neighborhood_id: parseInt(neighborhoodId)
                        }}
                    />

                    {/* Additional info */}
                    <Alert className="mt-6">
                        <span className="material-symbols-outlined text-sm">
                            info
                        </span>
                        <AlertDescription>
                            Une fois votre objet créé, vous pourrez définir ses périodes de disponibilité 
                            et commencer à recevoir des demandes d'emprunt de vos voisins.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        </div>
    );
}

export default withNeighborhoodLayout(AddItemPage);