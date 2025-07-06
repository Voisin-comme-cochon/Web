import { useState, useEffect } from 'react';
import { ItemRepository } from '@/infrastructure/repositories/ItemRepository';
import { ItemsUc } from '@/domain/use-cases/itemsUc';
import {
    ItemModel,
    ItemAvailabilityModel,
    CreateItemRequest,
    UpdateItemRequest,
    CreateItemAvailabilityRequest,
    UpdateItemAvailabilityRequest,
    GetItemsFilters,
} from '@/domain/models/item.model';
import { PaginatedResultModel } from '@/domain/models/paginated-result.model';
import { toast } from '@/hooks/use-toast';

export const useItems = (initialFilters?: GetItemsFilters) => {
    const [items, setItems] = useState<ItemModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    });

    const itemsUc = new ItemsUc(new ItemRepository());

    const fetchItems = async (filters: GetItemsFilters) => {
        setLoading(true);
        setError(null);
        try {
            const result = await itemsUc.getItems(filters);
            setItems(result.data);
            setPagination({
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des objets';
            setError(errorMessage);
            toast({
                title: 'Erreur',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialFilters) {
            fetchItems(initialFilters);
        }
    }, []);

    const refetch = (filters: GetItemsFilters) => {
        fetchItems(filters);
    };

    return {
        items,
        loading,
        error,
        pagination,
        refetch,
        fetchItems,
    };
};

export const useItem = (id?: number) => {
    const [item, setItem] = useState<ItemModel | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const itemsUc = new ItemsUc(new ItemRepository());

    const fetchItem = async (itemId: number) => {
        setLoading(true);
        setError(null);
        try {
            const result = await itemsUc.getItemById(itemId);
            setItem(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement de l'objet";
            setError(errorMessage);
            toast({
                title: 'Erreur',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchItem(id);
        }
    }, [id]);

    const refetch = () => {
        if (id) {
            fetchItem(id);
        }
    };

    return {
        item,
        loading,
        error,
        refetch,
        fetchItem,
    };
};

export const useCreateItem = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const itemsUc = new ItemsUc(new ItemRepository());

    const createItem = async (itemData: CreateItemRequest): Promise<ItemModel | null> => {
        setLoading(true);
        setError(null);
        try {
            const result = await itemsUc.createItem(itemData);
            toast({
                title: 'Succès',
                description: 'Objet créé avec succès',
            });
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création de l'objet";
            setError(errorMessage);
            toast({
                title: 'Erreur',
                description: errorMessage,
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        createItem,
        loading,
        error,
    };
};

export const useUpdateItem = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const itemsUc = new ItemsUc(new ItemRepository());

    const updateItem = async (id: number, itemData: UpdateItemRequest): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await itemsUc.updateItem(id, itemData);
            toast({
                title: 'Succès',
                description: 'Objet modifié avec succès',
            });
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Erreur lors de la modification de l'objet";
            setError(errorMessage);
            toast({
                title: 'Erreur',
                description: errorMessage,
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        updateItem,
        loading,
        error,
    };
};

export const useDeleteItem = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const itemsUc = new ItemsUc(new ItemRepository());

    const deleteItem = async (id: number): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await itemsUc.deleteItem(id);
            toast({
                title: 'Succès',
                description: 'Objet supprimé avec succès',
            });
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression de l'objet";
            setError(errorMessage);
            toast({
                title: 'Erreur',
                description: errorMessage,
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        deleteItem,
        loading,
        error,
    };
};

export const useItemAvailabilities = (itemId?: number) => {
    const [availabilities, setAvailabilities] = useState<ItemAvailabilityModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const itemsUc = new ItemsUc(new ItemRepository());

    const fetchAvailabilities = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const result = await itemsUc.getItemAvailabilities(id);
            setAvailabilities(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des disponibilités';
            setError(errorMessage);
            toast({
                title: 'Erreur',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (itemId) {
            fetchAvailabilities(itemId);
        }
    }, [itemId]);

    const createAvailability = async (availability: CreateItemAvailabilityRequest): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const result = await itemsUc.createItemAvailability(availability.item_id, availability);
            setAvailabilities((prev) => [...prev, result]);
            toast({
                title: 'Succès',
                description: 'Disponibilité ajoutée avec succès',
            });
            return true;
        } catch (err: any) {
            let errorMessage = "Erreur lors de l'ajout de la disponibilité";

            if (err?.response?.data?.message) {
                const backendMessage = err.response.data.message;
                switch (err.response.data.code) {
                    case 'item_not_found':
                        errorMessage = "L'objet n'existe plus.";
                        break;
                    case 'forbidden_availability':
                        errorMessage = 'Vous ne pouvez gérer que les disponibilités de vos propres objets.';
                        break;
                    case 'invalid_dates':
                        errorMessage =
                            'Les dates sélectionnées ne sont pas valides. La date de fin doit être postérieure ou égale à la date de début.';
                        break;
                    case 'past_date':
                        errorMessage = 'La date de début ne peut pas être dans le passé.';
                        break;
                    default:
                        errorMessage = backendMessage || errorMessage;
                }
            } else if (err?.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            toast({
                title: 'Erreur',
                description: errorMessage,
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateAvailability = async (
        availabilityId: number,
        availability: UpdateItemAvailabilityRequest
    ): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await itemsUc.updateItemAvailability(availabilityId, availability);
            if (itemId) {
                await fetchAvailabilities(itemId);
            }
            toast({
                title: 'Succès',
                description: 'Disponibilité modifiée avec succès',
            });
            return true;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Erreur lors de la modification de la disponibilité';
            setError(errorMessage);
            toast({
                title: 'Erreur',
                description: errorMessage,
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteAvailability = async (availabilityId: number): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await itemsUc.deleteItemAvailability(availabilityId);
            setAvailabilities((prev) => prev.filter((a) => a.id !== availabilityId));
            toast({
                title: 'Succès',
                description: 'Disponibilité supprimée avec succès',
            });
            return true;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Erreur lors de la suppression de la disponibilité';
            setError(errorMessage);
            toast({
                title: 'Erreur',
                description: errorMessage,
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const refetch = () => {
        if (itemId) {
            fetchAvailabilities(itemId);
        }
    };

    return {
        availabilities,
        loading,
        error,
        refetch,
        createAvailability,
        updateAvailability,
        deleteAvailability,
    };
};
