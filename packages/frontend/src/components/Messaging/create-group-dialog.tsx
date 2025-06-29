import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Lock, Globe, X, CloudUpload, Paperclip } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import AvatarComponent from '@/components/AvatarComponent/AvatarComponent';

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
import { FileInput, FileUploader, FileUploaderContent, FileUploaderItem } from '@/components/ui/file-input';
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
    firstName?: string;
    lastName?: string;
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
        groupImage?: File;
    }) => void;
    neighborhoodId?: number;
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [availableTags, setAvailableTags] = useState<TagModel[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [groupImageFiles, setGroupImageFiles] = useState<File[]>([]);

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

    // Surveiller le type de groupe sélectionné
    const selectedGroupType = useWatch({
        control: form.control,
        name: 'type',
    });

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
                        avatar: user.profileImageUrl,
                        firstName: user.firstName,
                        lastName: user.lastName,
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

    // Reset selected members when switching to public group
    useEffect(() => {
        if (selectedGroupType === 'public') {
            setSelectedMembers([]);
            setSearchQuery('');
        }
    }, [selectedGroupType]);

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
                members: values.type === 'private' ? selectedMembers : [], // Only include members for private groups
                createdAt: new Date().toISOString(),
                avatar: '/placeholder.svg?height=40&width=40',
                groupImage: groupImageFiles[0], // Add the uploaded image
            };

            onCreateGroup(newGroup);
            onOpenChange(false);

            form.reset();
            setSelectedMembers([]);
            setSearchQuery('');
            setGroupImageFiles([]);
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
            setGroupImageFiles([]);
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleDialogClose}>
            <DialogContent className="sm:max-w-[700px] lg:max-w-[700px] max-h-[90vh] overflow-y-auto w-[95vw] sm:w-[700px] sm:min-w-[700px]">
                <DialogHeader>
                    <DialogTitle className="text-primary">Créer un nouveau groupe</DialogTitle>
                    <DialogDescription>
                        Créez un canal de discussion pour échanger avec plusieurs personnes.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-2 pl-2"
                    >
                        {/* Image upload field */}
                        <div className="space-y-2">
                            <Label className="text-primary">Image du groupe</Label>
                            <FileUploader
                                value={groupImageFiles}
                                onValueChange={setGroupImageFiles}
                                dropzoneOptions={{
                                    maxFiles: 1,
                                    maxSize: 1024 * 1024 * 4, // 4MB
                                    multiple: false,
                                }}
                                className="relative bg-background rounded-lg p-2"
                            >
                                <FileInput className="outline-dashed outline-1 outline-slate-500">
                                    <div className="flex items-center justify-center flex-col p-4 w-full">
                                        <CloudUpload className="text-gray-500 w-6 h-6 sm:w-8 sm:h-8" />
                                        <p className="mb-1 text-xs sm:text-sm text-gray-500 text-center">
                                            <span className="font-semibold">Cliquez pour télécharger</span>
                                            <span className="hidden sm:inline"> ou glissez-déposez</span>
                                        </p>
                                        <p className="text-xs text-gray-500 text-center">PNG, JPG ou GIF (max 4MB)</p>
                                    </div>
                                </FileInput>
                                <FileUploaderContent>
                                    {groupImageFiles.map((file, i) => (
                                        <FileUploaderItem key={i} index={i}>
                                            <Paperclip className="h-4 w-4 stroke-current" />
                                            <span>{file.name}</span>
                                        </FileUploaderItem>
                                    ))}
                                </FileUploaderContent>
                            </FileUploader>
                            <p className="text-xs text-muted-foreground">
                                Ajoutez une image pour représenter votre groupe (optionnel)
                            </p>
                        </div>

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
                                            className="border-border focus-visible:ring-black"
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
                                            className="border-border focus-visible:ring-black resize-none h-20"
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
                                                <RadioGroupItem value="public" id="public" />
                                                <FormLabel
                                                    htmlFor="public"
                                                    className="flex items-center cursor-pointer"
                                                >
                                                    <Globe size={16} className="mr-1 text-muted-foreground" />
                                                    Public
                                                </FormLabel>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="private" id="private" />
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
                        {/* Section d'ajout de membres - uniquement pour les groupes privés */}
                        {selectedGroupType === 'private' && (
                            <div className="space-y-2">
                                <Label className="text-primary">Ajouter des membres</Label>
                                <p className="text-xs text-muted-foreground">
                                    Invitez des personnes à rejoindre votre groupe privé
                                </p>
                                <div className="relative">
                                    <Search
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                        size={16}
                                    />
                                    <Input
                                        placeholder="Rechercher des personnes..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 border-border focus-visible:ring-black"
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
                                                <AvatarComponent
                                                    image={member.avatar}
                                                    className="w-5 h-5 mr-1"
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
                                    <div className="mt-2 border border-border rounded-md max-h-32 sm:max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                                                    <div className="mr-2">
                                                        <AvatarComponent
                                                            image={user.avatar}
                                                            className="w-8 h-8"
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
                        )}

                        {/* Information pour les groupes publics */}
                        {selectedGroupType === 'public' && (
                            <div className="space-y-2 p-3 sm:p-4 bg-muted/50 rounded-lg border border-border">
                                <div className="flex items-center text-primary">
                                    <Globe size={16} className="mr-2 flex-shrink-0" />
                                    <span className="font-medium text-sm sm:text-base">Groupe public</span>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Les groupes publics sont visibles par tous les membres du quartier. Les utilisateurs
                                    peuvent les rejoindre librement via l'onglet "Découvrir".
                                </p>
                            </div>
                        )}
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
