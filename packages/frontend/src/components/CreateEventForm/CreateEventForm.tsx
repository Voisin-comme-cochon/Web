'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CloudUpload, Paperclip } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AddressAutocomplete } from '@/components/AddressSuggestion/AddressSuggestion.tsx';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { SmartDatetimeInput } from '@/components/ui/smart-datetime-input';
import { fr } from 'date-fns/locale';
import { FileInput, FileUploader, FileUploaderContent, FileUploaderItem } from '@/components/ui/file-input.tsx';
import { SelectedAddress } from '@/domain/models/SelectedAddress.ts';
import { TagModel } from '@/domain/models/tag.model.ts';
import ComboboxComponentTag from '@/components/ComboboxComponent/ComboboxComponentTag.tsx';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { useToast } from '@/presentation/hooks/useToast.ts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
    file_event_input: z.array(z.instanceof(File)).max(1, 'Maximum 1 fichier'),
    name_event_input: z.string().min(1, 'Le nom est requis'),
    tag_input: z
        .number({ required_error: 'Sélectionnez au moins un tag' })
        .nullable()
        .refine((val) => val !== null, {
            message: 'Sélectionnez au moins un tag',
        }),
    description_event_input: z.string(),
    address: z.string().optional(),
    end_address: z.string().optional(),
    date_start_event_input: z.date(),
    date_end_event_input: z.date(),
    max_users_event_input: z.number().min(1, 'Au moins 1 participant'),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateEventForm({ uc, neighborhoodId }: { uc: HomeUc; neighborhoodId: number }) {
    const [files, setFiles] = useState<File[]>([]);
    const [showAddress, setShowAddress] = useState(false);
    const [showEndAddress, setShowEndAddress] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
    const [selectedEndAddress, setSelectedEndAddress] = useState<SelectedAddress | null>(null);
    const [tags, setTags] = useState<TagModel[] | null>(null);
    const [tag, setTag] = useState<number | null>(null);
    const [type, setType] = useState<'event' | 'service'>('event');
    const { showSuccess, showError } = useToast();

    const handleSetTag = (selectedTag: number | null) => {
        setTag(selectedTag);
        if (selectedTag) {
            form.setValue('tag_input', selectedTag, { shouldValidate: true });
        } else {
            form.setValue('tag_input', null, { shouldValidate: true });
        }
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tag_input: null,
            date_start_event_input: new Date(),
            date_end_event_input: new Date(),
            address: '',
            end_address: '',
        },
    });

    async function onSubmit(values: FormValues) {
        try {
            const payload = { ...values };
            await uc.createEvent(
                neighborhoodId,
                payload.name_event_input,
                payload.description_event_input,
                payload.date_start_event_input,
                payload.date_end_event_input ?? payload.date_start_event_input,
                1,
                payload.max_users_event_input ?? 1,
                payload.tag_input ?? 0,
                selectedAddress,
                selectedEndAddress,
                files[0],
                type
            );
            showSuccess('Évènement créé avec succès !');
            window.history.back();
        } catch (err) {
            showError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
        }
    }

    const dropZoneConfig = {
        maxFiles: 1,
        maxSize: 1024 * 1024 * 4,
        multiple: true,
    };

    useEffect(() => {
        const fetchTags = async () => {
            const resTags = await uc.getTags();
            setTags(resTags);
        };

        fetchTags();
    }, []);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-3xl mx-auto">
                {/* Select pour choisir entre service et event */}
                <div>
                    <label className="block mb-1 font-medium">Type</label>
                    <Select value={type} onValueChange={(v) => setType(v as 'event' | 'service')}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choisir un type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="event">Évènement</SelectItem>
                            <SelectItem value="service">Service</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <FormField
                    control={form.control}
                    name="file_event_input"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Photo de l'évènement</FormLabel>
                            <FormControl>
                                <FileUploader
                                    value={files}
                                    onValueChange={(f) => {
                                        setFiles(f);
                                        field.onChange(f);
                                    }}
                                    dropzoneOptions={dropZoneConfig}
                                    className="relative bg-background rounded-lg p-2"
                                >
                                    <FileInput id="fileInput" className="outline-dashed outline-1 outline-slate-500">
                                        <div className="flex items-center justify-center flex-col p-8 w-full">
                                            <CloudUpload className="text-gray-500 w-10 h-10" />
                                            <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                SVG, PNG, JPG or GIF
                                            </p>
                                        </div>
                                    </FileInput>
                                    <FileUploaderContent>
                                        {files.map((file, i) => (
                                            <FileUploaderItem key={i} index={i}>
                                                <Paperclip className="h-4 w-4 stroke-current" />
                                                <span>{file.name}</span>
                                            </FileUploaderItem>
                                        ))}
                                    </FileUploaderContent>
                                </FileUploader>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="name_event_input"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom de l'évènement</FormLabel>
                            <FormControl>
                                <Input placeholder="Bingo du village" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="tag_input"
                    render={({ field }) => (
                        <FormItem className={'flex flex-col'}>
                            <FormLabel>Catégorie de l'évènement</FormLabel>
                            <FormControl>
                                <ComboboxComponentTag
                                    tags={tags ?? []}
                                    {...field}
                                    value={field.value}
                                    handleSetTag={handleSetTag}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description_event_input"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Organisation, contexte..." className="resize-none" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="date_start_event_input"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date de début</FormLabel>
                            <FormControl>
                                <SmartDatetimeInput
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="e.g. Demain matin 9h"
                                    locale={fr}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="date_end_event_input"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date de fin</FormLabel>
                            <FormControl>
                                <SmartDatetimeInput
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="e.g. Demain matin 11h"
                                    locale={fr}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormItem className="flex items-center justify-between">
                    <FormLabel>Lieu dans l'évènement ?</FormLabel>
                    <Switch checked={showAddress} onCheckedChange={setShowAddress} />
                </FormItem>

                {showAddress && (
                    <>
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Adresse de début</FormLabel>
                                    <FormControl>
                                        <AddressAutocomplete
                                            value={field.value}
                                            onChange={(value) => {
                                                field.onChange(value);
                                            }}
                                            placeholder="123 rue de la République, 75001 Paris"
                                            onAddressSelect={(addressData) => setSelectedAddress(addressData)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormItem className="flex items-center justify-between">
                            <FormLabel>Lieu de fin différent ?</FormLabel>
                            <Switch checked={showEndAddress} onCheckedChange={setShowEndAddress} />
                        </FormItem>

                        {showEndAddress && (
                            <FormField
                                control={form.control}
                                name="end_address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Adresse de fin</FormLabel>
                                        <FormControl>
                                            <AddressAutocomplete
                                                value={field.value}
                                                onChange={(value) => {
                                                    field.onChange(value);
                                                }}
                                                placeholder="456 avenue Victor Hugo, 75016 Paris"
                                                onAddressSelect={(addressData) => setSelectedEndAddress(addressData)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </>
                )}

                <FormField
                    control={form.control}
                    name="max_users_event_input"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Participants maximums</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="1"
                                    type="number"
                                    value={field.value ?? ''}
                                    onChange={(e) =>
                                        field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button variant="orange" className={'w-full'} onClick={() => {}}>
                    Envoyer
                </Button>
            </form>
        </Form>
    );
}
