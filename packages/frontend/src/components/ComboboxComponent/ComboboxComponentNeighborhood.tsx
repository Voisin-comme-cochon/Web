import * as React from 'react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood.ts';

const LOCALSTORAGE_KEY = 'neighborhoodId';

export default function ComboboxComponentNeighborhood({
    neighborhoods = [],
    onNeighborhoodChange,
}: {
    neighborhoods?: FrontNeighborhood[];
    onNeighborhoodChange?: () => void;
}) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState<string>('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(LOCALSTORAGE_KEY);
            if (saved && neighborhoods.some((n) => n.id.toString() === saved)) {
                setValue(saved);
            }
        }
    }, [neighborhoods]);

    const handleSelect = (currentId: string) => {
        if (currentId === value) {
            setValue('');
            localStorage.removeItem(LOCALSTORAGE_KEY);
        } else {
            setValue(currentId);
            localStorage.setItem(LOCALSTORAGE_KEY, currentId);
        }
        setOpen(false);
        if (onNeighborhoodChange) {
            onNeighborhoodChange();
        }
    };

    const selectedName = neighborhoods.find((n) => n.id.toString() === value)?.name || 'Choisir un quartier';

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
                    {selectedName}
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
                                    onSelect={() => handleSelect(neighborhood.id.toString())}
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
