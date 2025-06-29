import { useState, useEffect, useMemo } from 'react';
import { Lock, Globe, CloudUpload, Paperclip } from 'lucide-react';
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
import { FileInput, FileUploader, FileUploaderContent, FileUploaderItem } from '@/components/ui/file-input';
import { TagModel } from '@/domain/models/tag.model';
import { GroupModel, GroupType } from '@/domain/models/messaging.model';
import { MessagingUc } from '@/domain/use-cases/messagingUc';
import { TagUc } from '@/domain/use-cases/tagUc';
import { MessagingRepository } from '@/infrastructure/repositories/MessagingRepository';
import { TagRepository } from '@/infrastructure/repositories/TagRepository';
import { editGroupFormSchema, EditGroupFormValues } from './edit-group-dialog.schema';
import { useToast } from '@/presentation/hooks/useToast';

interface EditGroupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    group: GroupModel | null;
    onGroupUpdated?: () => void;
}

export function EditGroupDialog({
    open,
    onOpenChange,
    group,
    onGroupUpdated,
}: EditGroupDialogProps) {
    const [availableTags, setAvailableTags] = useState<TagModel[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [groupImageFiles, setGroupImageFiles] = useState<File[]>([]);
    const { showSuccess, showError } = useToast();

    // Configuration du formulaire avec validation
    const form = useForm<EditGroupFormValues>({
        resolver: zodResolver(editGroupFormSchema),
        defaultValues: {
            name: '',
            description: '',
            type: 'public',
            tagId: '',
        },
    });

    // Instances des use cases
    const messagingUc = useMemo(() => new MessagingUc(new MessagingRepository()), []);
    const tagUc = useMemo(() => new TagUc(new TagRepository()), []);

    // Charger les données du groupe dans le formulaire
    useEffect(() => {
        if (group && open) {
            form.reset({
                name: group.name,
                description: group.description,
                type: group.type === GroupType.PUBLIC ? 'public' : 'private',
                tagId: group.tagId?.toString() || '',
            });
            setGroupImageFiles([]);
        }
    }, [group, open, form]);

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

        if (open) {
            void loadTags();
        }
    }, [tagUc, open]);

    const onSubmit = async (values: EditGroupFormValues) => {
        if (isSubmitting || !group) return;

        setIsSubmitting(true);
        try {
            // Mapper les types du formulaire vers les types de l'API
            const groupType = values.type === 'public' ? GroupType.PUBLIC : GroupType.PRIVATE_GROUP;
            
            const updateData = {
                name: values.name,
                description: values.description,
                type: groupType,
                isPrivate: groupType !== GroupType.PUBLIC,
                tagId: values.tagId && values.tagId !== '' ? parseInt(values.tagId, 10) : undefined,
                groupImage: groupImageFiles[0], // Nouvelle image si uploadée
            };

            await messagingUc.updateGroup(group.id, updateData);
            
            showSuccess('Groupe modifié avec succès');
            onGroupUpdated?.();
            onOpenChange(false);

            form.reset();
            setGroupImageFiles([]);
        } catch (error) {
            console.error('Erreur lors de la modification du groupe:', error);
            showError('Erreur lors de la modification du groupe');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDialogClose = (open: boolean) => {
        if (!open && !isSubmitting) {
            form.reset();
            setGroupImageFiles([]);
        }
        onOpenChange(open);
    };

    if (!group) return null;

    return (
        <Dialog open={open} onOpenChange={handleDialogClose}>
            <DialogContent className="sm:max-w-[600px] lg:max-w-[700px] max-h-[90vh] overflow-y-auto w-[95vw] sm:w-auto sm:min-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-primary">Modifier le groupe</DialogTitle>
                    <DialogDescription>
                        Modifiez les informations de votre groupe.
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
                                {group.imageUrl ? 'Téléchargez une nouvelle image pour remplacer l\'actuelle (optionnel)' : 'Ajoutez une image pour représenter votre groupe (optionnel)'}
                            </p>
                            {group.imageUrl && groupImageFiles.length === 0 && (
                                <div className="flex items-center space-x-2">
                                    <img
                                        src={group.imageUrl}
                                        alt={group.name}
                                        className="w-12 h-12 rounded-full object-cover border"
                                    />
                                    <span className="text-sm text-muted-foreground">Image actuelle</span>
                                </div>
                            )}
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
                                                <RadioGroupItem value="public" id="edit-public" />
                                                <FormLabel
                                                    htmlFor="edit-public"
                                                    className="flex items-center cursor-pointer"
                                                >
                                                    <Globe size={16} className="mr-1 text-muted-foreground" />
                                                    Public
                                                </FormLabel>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="private" id="edit-private" />
                                                <FormLabel
                                                    htmlFor="edit-private"
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
                                    <div className="mt-2 p-3 bg-orange/10 rounded-lg border border-orange/20">
                                        <p className="text-xs text-orange-600">
                                            <strong>Note:</strong> Changer le type du groupe affectera qui peut rejoindre le groupe à l'avenir. 
                                            Les membres actuels restent dans le groupe.
                                        </p>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                {isSubmitting ? 'Modification...' : 'Modifier le groupe'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}