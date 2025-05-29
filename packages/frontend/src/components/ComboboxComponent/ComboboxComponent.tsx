import * as React from 'react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood.ts';

const LOCALSTORAGE_KEY = 'selectedNeighborhoodId';

export default function ComboboxComponent({
    neighborhoods = [],
    setNeighborhoodId,
}: {
    neighborhoods?: FrontNeighborhood[];
    setNeighborhoodId?: (id: number) => void;
}) {
    const getInitialValue = () => {
        if (typeof window === 'undefined') return '';
        const saved = localStorage.getItem(LOCALSTORAGE_KEY);
        if (saved && neighborhoods.some((n) => n.id.toString() === saved)) {
            return saved;
        }
        return neighborhoods[0]?.id?.toString() || '';
    };

    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState<string>(getInitialValue);

    useEffect(() => {
        const saved = localStorage.getItem(LOCALSTORAGE_KEY);
        if (saved && neighborhoods.some((n) => n.id.toString() === saved)) {
            setValue(saved);
            setNeighborhoodId?.(Number(saved));
        } else if (neighborhoods.length) {
            setValue(neighborhoods[0].id.toString());
            setNeighborhoodId?.(neighborhoods[0].id);
            localStorage.setItem(LOCALSTORAGE_KEY, neighborhoods[0].id.toString());
        }
    }, [neighborhoods]);

    const handleSelect = (currentId: string) => {
        if (currentId === value) {
            setValue('');
            setNeighborhoodId?.(-1);
            localStorage.removeItem(LOCALSTORAGE_KEY);
        } else {
            setValue(currentId);
            setNeighborhoodId?.(Number(currentId));
            localStorage.setItem(LOCALSTORAGE_KEY, currentId);
        }
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
                    {neighborhoods.find((n) => n.id.toString() === value)?.name || 'Choisir un quartier'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Chercher un quartier" />
                    <CommandList>
                        <CommandEmpty>Aucun quartier trouvé.</CommandEmpty>
                        <CommandGroup>
                            {neighborhoods.map((neighborhood) => (
                                <CommandItem
                                    key={neighborhood.id}
                                    value={neighborhood.id.toString()}
                                    onSelect={handleSelect}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            value === neighborhood.id.toString() ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                    {neighborhood.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
