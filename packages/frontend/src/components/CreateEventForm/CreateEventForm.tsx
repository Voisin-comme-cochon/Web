'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CloudUpload, Paperclip } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AddressAutocomplete } from '@/components/AddressSuggestion/AddressSuggestion.tsx';
import { Switch } from '@/components/ui/switch';
import {
    MultiSelector,
    MultiSelectorContent,
    MultiSelectorInput,
    MultiSelectorItem,
    MultiSelectorList,
    MultiSelectorTrigger,
} from '@/components/ui/multi-select';
import { Textarea } from '@/components/ui/textarea';
import { SmartDatetimeInput } from '@/components/ui/smart-datetime-input';
import { fr } from 'date-fns/locale';
import { FileInput, FileUploader, FileUploaderContent, FileUploaderItem } from '@/components/ui/file-input.tsx';

// Schéma de validation
const formSchema = z.object({
    file_event_input: z.array(z.instanceof(File)).max(1, 'Maximum 1 fichier').optional(),
    name_event_input: z.string().min(1, 'Le nom est requis'),
    multiselect_tag_input: z.array(z.string()).nonempty('Sélectionnez au moins un tag'),
    description_event_input: z.string(),
    address: z.string().optional(),
    end_address: z.string().optional(),
    date_start_event_input: z.date(),
    date_end_event_input: z.date().optional(),
    min_users_event_input: z.number().min(1, 'Au moins 1 participant'),
    max_users_event_input: z.number().min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateEventForm() {
    const [files, setFiles] = useState<File[]>([]);
    const [showAddress, setShowAddress] = useState(false);
    const [showEndAddress, setShowEndAddress] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<any>(null);
    const [selectedEndAddress, setSelectedEndAddress] = useState<any>(null);
    const [errorStart, setErrorStart] = useState<string | null>(null);
    const [errorEnd, setErrorEnd] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            multiselect_tag_input: ['React'],
            date_start_event_input: new Date(),
            date_end_event_input: new Date(),
            address: '',
            end_address: '',
        },
    });

    function onSubmit(values: FormValues) {
        if (showAddress && !selectedAddress) {
            setErrorStart('Veuillez sélectionner une adresse de début valide');
            return;
        }
        if (showEndAddress && !selectedEndAddress) {
            setErrorEnd('Veuillez sélectionner une adresse de fin valide');
            return;
        }
        const payload = { ...values };
        console.log(payload);
        toast(
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                <code className="text-white">{JSON.stringify(payload, null, 2)}</code>
            </pre>
        );
    }

    const dropZoneConfig = {
        maxFiles: 1,
        maxSize: 1024 * 1024 * 4,
        multiple: true,
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-3xl mx-auto">
                {/* Upload */}
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

                {/* Nom */}
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

                {/* Catégories */}
                <FormField
                    control={form.control}
                    name="multiselect_tag_input"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Catégorie de l'évènement</FormLabel>
                            <FormControl>
                                <MultiSelector
                                    values={field.value}
                                    onValuesChange={field.onChange}
                                    loop
                                    className="max-w-xs"
                                >
                                    <MultiSelectorTrigger>
                                        <MultiSelectorInput placeholder="Sélectionnez..." />
                                    </MultiSelectorTrigger>
                                    <MultiSelectorContent>
                                        <MultiSelectorList>
                                            <MultiSelectorItem value="React">React</MultiSelectorItem>
                                            <MultiSelectorItem value="Vue">Vue</MultiSelectorItem>
                                            <MultiSelectorItem value="Svelte">Svelte</MultiSelectorItem>
                                        </MultiSelectorList>
                                    </MultiSelectorContent>
                                </MultiSelector>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Description */}
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

                {/* Dates toujours présentes */}
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

                {/* Switch: afficher l'adresse */}
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
                                                setErrorStart(null);
                                            }}
                                            placeholder="123 rue de la République, 75001 Paris"
                                            onAddressSelect={(addressData) => setSelectedAddress(addressData)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    {errorStart && <p className="text-red-500 text-sm mt-1">{errorStart}</p>}
                                </FormItem>
                            )}
                        />

                        {/* Switch: lieu de fin différent */}
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
                                                    setErrorEnd(null);
                                                }}
                                                placeholder="456 avenue Victor Hugo, 75016 Paris"
                                                onAddressSelect={(addressData) => setSelectedEndAddress(addressData)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        {errorEnd && <p className="text-red-500 text-sm mt-1">{errorEnd}</p>}
                                    </FormItem>
                                )}
                            />
                        )}
                    </>
                )}

                {/* Participants min */}
                <FormField
                    control={form.control}
                    name="min_users_event_input"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Participants minimums</FormLabel>
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

                {/* Participants max */}
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

                <Button variant="orange" className={'w-full'} onClick={() => window.history.back()}>
                    Envoyer
                </Button>
            </form>
        </Form>
    );
}
