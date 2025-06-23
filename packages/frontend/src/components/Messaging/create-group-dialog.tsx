import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Lock, Globe, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TagModel } from '@/domain/models/tag.model';
import { MessagingUc } from '@/domain/use-cases/messagingUc';
import { TagUc } from '@/domain/use-cases/tagUc';
import { MessagingRepository } from '@/infrastructure/repositories/MessagingRepository';
import { TagRepository } from '@/infrastructure/repositories/TagRepository';
import { createGroupFormSchema, CreateGroupFormValues } from './create-group-dialog.schema';

type User = {
    id: number;
    name: string;
    avatar?: string;
};

export function CreateGroupDialog({
    open,
    onOpenChange,
    onCreateGroup,
    neighborhoodId,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateGroup: (group: {
        id: string;
        name: string;
        description: string;
        type: 'public' | 'private';
        members: User[];
        avatar: string;
    }) => void;
    neighborhoodId?: number;
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [availableTags, setAvailableTags] = useState<TagModel[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Configuration du formulaire avec validation
    const form = useForm<CreateGroupFormValues>({
        resolver: zodResolver(createGroupFormSchema),
        defaultValues: {
            name: '',
            description: '',
            type: 'public',
            tagId: '',
            memberIds: [],
        },
    });

    // Instances des use cases
    const messagingUc = useMemo(() => new MessagingUc(new MessagingRepository()), []);
    const tagUc = useMemo(() => new TagUc(new TagRepository()), []);

    // Chargement des tags disponibles
    useEffect(() => {
        const loadTags = async () => {
            try {
                const tags = await tagUc.getTags();
                setAvailableTags(tags);
            } catch (error) {
                console.error('Erreur lors du chargement des tags:', error);
            }
        };

        void loadTags();
    }, [tagUc]);

    // Recherche d'utilisateurs
    useEffect(() => {
        const searchUsers = async () => {
            if (!neighborhoodId || !searchQuery.trim() || searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const users = await messagingUc.searchUsers(neighborhoodId, searchQuery);
                const convertedUsers: User[] = users
                    .filter((user) => !selectedMembers.some((member) => member.id === user.id))
                    .map((user) => ({
                        id: user.id,
                        name: `${user.firstName} ${user.lastName}`,
                        avatar: user.avatarUrl,
                    }));
                setSearchResults(convertedUsers);
            } catch (error) {
                console.error("Erreur lors de la recherche d'utilisateurs:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(searchUsers, 300); // Debounce de 300ms
        return () => clearTimeout(timeoutId);
    }, [searchQuery, neighborhoodId, selectedMembers, messagingUc]);

    useEffect(() => {
        form.setValue(
            'memberIds',
            selectedMembers.map((member) => member.id)
        );
    }, [selectedMembers, form]);

    const handleAddMember = (user: User) => {
        setSelectedMembers([...selectedMembers, user]);
        setSearchQuery('');
    };

    const handleRemoveMember = (userId: number) => {
        setSelectedMembers(selectedMembers.filter((member) => member.id !== userId));
    };

    const onSubmit = async (values: CreateGroupFormValues) => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const newGroup = {
                id: `group-${Date.now()}`,
                name: values.name,
                description: values.description,
                type: values.type,
                tagId: values.tagId && values.tagId !== '' ? parseInt(values.tagId, 10) : undefined,
                members: selectedMembers,
                createdAt: new Date().toISOString(),
                avatar: '/placeholder.svg?height=40&width=40',
            };

            onCreateGroup(newGroup);
            onOpenChange(false);

            form.reset();
            setSelectedMembers([]);
            setSearchQuery('');
        } catch (error) {
            console.error('Erreur lors de la création du groupe:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDialogClose = (open: boolean) => {
        if (!open && !isSubmitting) {
            form.reset();
            setSelectedMembers([]);
            setSearchQuery('');
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleDialogClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-primary">Créer un nouveau groupe</DialogTitle>
                    <DialogDescription>
                        Créez un canal de discussion pour échanger avec plusieurs personnes.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-primary">Nom du groupe</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ex: Voisins du Quartier"
                                            {...field}
                                            className="border-border focus-visible:ring-orange"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-primary">Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Décrivez l'objectif de ce groupe..."
                                            {...field}
                                            className="border-border focus-visible:ring-orange resize-none h-20"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="tagId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-primary">Tag du groupe</FormLabel>
                                    <Select
                                        value={field.value?.toString() || ''}
                                        onValueChange={(value) => field.onChange(value || undefined)}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="border-border focus:ring-orange">
                                                <SelectValue placeholder="Sélectionner un tag (optionnel)" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {availableTags.map((tag) => (
                                                <SelectItem key={tag.id} value={tag.id.toString()}>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: tag.color }}
                                                        />
                                                        {tag.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Choisissez un tag pour catégoriser votre groupe
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-primary">Type de groupe</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            className="flex gap-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="public" id="public" className="text-orange" />
                                                <FormLabel
                                                    htmlFor="public"
                                                    className="flex items-center cursor-pointer"
                                                >
                                                    <Globe size={16} className="mr-1 text-muted-foreground" />
                                                    Public
                                                </FormLabel>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="private" id="private" className="text-orange" />
                                                <FormLabel
                                                    htmlFor="private"
                                                    className="flex items-center cursor-pointer"
                                                >
                                                    <Lock size={16} className="mr-1 text-muted-foreground" />
                                                    Privé
                                                </FormLabel>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {field.value === 'public'
                                            ? 'Tout le monde peut trouver et rejoindre ce groupe.'
                                            : 'Seules les personnes invitées peuvent rejoindre ce groupe.'}
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="space-y-2">
                            <Label className="text-primary">Ajouter des membres</Label>
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                    size={16}
                                />
                                <Input
                                    placeholder="Rechercher des personnes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 border-border focus-visible:ring-orange"
                                />
                            </div>

                            {/* Selected Members */}
                            {selectedMembers.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedMembers.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center bg-muted rounded-full pl-1 pr-2 py-1"
                                        >
                                            <img
                                                src={member.avatar || '/placeholder.svg'}
                                                alt={member.name}
                                                className="w-5 h-5 rounded-full mr-1"
                                            />
                                            <span className="text-xs text-primary">{member.name}</span>
                                            <button
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="ml-1 text-muted-foreground hover:text-primary"
                                            >
                                                <X size={14} />
                                                <span className="sr-only">Retirer {member.name}</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Search Results */}
                            {searchQuery && searchQuery.length >= 2 && (
                                <div className="mt-2 border border-border rounded-md max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                    {isSearching ? (
                                        <div className="p-3 text-center text-muted-foreground text-sm">
                                            Recherche en cours...
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        searchResults.map((user) => (
                                            <div
                                                key={user.id}
                                                onClick={() => handleAddMember(user)}
                                                className="flex items-center p-2 hover:bg-muted cursor-pointer"
                                            >
                                                <div className="relative">
                                                    <img
                                                        src={user.avatar || '/placeholder.svg'}
                                                        alt={user.name}
                                                        className="w-8 h-8 rounded-full mr-2"
                                                    />
                                                </div>
                                                <span className="text-sm text-primary">{user.name}</span>
                                                <Plus size={16} className="ml-auto text-orange" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-3 text-center text-muted-foreground text-sm">
                                            Aucun utilisateur trouvé
                                        </div>
                                    )}
                                </div>
                            )}

                            {searchQuery && searchQuery.length > 0 && searchQuery.length < 2 && (
                                <div className="mt-2 p-2 text-xs text-muted-foreground">
                                    Tapez au moins 2 caractères pour rechercher
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleDialogClose(false)}
                                disabled={isSubmitting}
                                className="border-border text-primary"
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-orange hover:bg-orange-hover text-white"
                            >
                                {isSubmitting ? 'Création...' : 'Créer le groupe'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
