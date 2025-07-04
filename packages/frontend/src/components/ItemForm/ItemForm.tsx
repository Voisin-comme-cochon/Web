import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreateItemRequest, UpdateItemRequest } from '@/domain/models/item.model';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ItemFormProps {
    initialData?: Partial<CreateItemRequest & { image_url?: string }>;
    onSubmit: (data: CreateItemRequest | UpdateItemRequest) => Promise<void>;
    isEditing?: boolean;
    loading?: boolean;
    error?: string | null;
}

const CATEGORIES = [
    'Électroménager',
    'Outils',
    'Jardinage',
    'Sport',
    'Cuisine',
    'Décoration',
    'Informatique',
    'Véhicules',
    'Livres',
    'Jouets',
    'Autre'
];

export default function ItemForm({ 
    initialData, 
    onSubmit, 
    isEditing = false, 
    loading = false, 
    error 
}: ItemFormProps) {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(
        initialData?.image_url || null
    );

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<CreateItemRequest>({
        defaultValues: {
            name: initialData?.name || '',
            description: initialData?.description || '',
            category: initialData?.category || '',
            neighborhood_id: initialData?.neighborhood_id || 0
        }
    });

    const selectedCategory = watch('category');

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFormSubmit = async (data: CreateItemRequest) => {
        const submitData = {
            ...data,
            image: selectedImage || undefined
        };

        console.log('Form submit data:', submitData);
        await onSubmit(submitData);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {isEditing ? 'Modifier l\'objet' : 'Ajouter un nouvel objet'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="image">Photo de l'objet</Label>
                        <div className="flex flex-col items-center gap-4">
                            {imagePreview && (
                                <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                        src={imagePreview}
                                        alt="Aperçu"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Nom de l'objet *</Label>
                        <Input
                            id="name"
                            {...register('name', { 
                                required: 'Le nom de l\'objet est requis',
                                minLength: { value: 2, message: 'Le nom doit contenir au moins 2 caractères' }
                            })}
                            placeholder="Ex: Perceuse, Livre de cuisine..."
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Décrivez votre objet, son état, ses caractéristiques..."
                            rows={4}
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Catégorie</Label>
                        <Select
                            value={selectedCategory || 'none'}
                            onValueChange={(value) => setValue('category', value === 'none' ? '' : value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Aucune catégorie</SelectItem>
                                {CATEGORIES.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-sm mr-2">
                                    refresh
                                </span>
                                {isEditing ? 'Modification...' : 'Création...'}
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-sm mr-2">
                                    {isEditing ? 'edit' : 'add'}
                                </span>
                                {isEditing ? 'Modifier l\'objet' : 'Créer l\'objet'}
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}