import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood.ts';

export default function ComboboxComponent({
    neighborhoods = [],
    setNeighborhoodId,
}: {
    neighborhoods?: FrontNeighborhood[];
    setNeighborhoodId?: (id: number) => void;
}) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState(neighborhoods[0]?.id?.toString() || '');

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
                    {neighborhoods.find((neighborhood) => neighborhood.id.toString() === value)?.name ||
                        'Choisir un quartier'}
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
                                    onSelect={(currentId) => {
                                        if (currentId === value) {
                                            setValue('');
                                            setNeighborhoodId?.(-1);
                                        } else {
                                            setValue(currentId);
                                            setNeighborhoodId?.(Number(currentId));
                                        }
                                        setOpen(false);
                                    }}
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
