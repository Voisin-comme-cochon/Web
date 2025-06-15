import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { TagModel } from '@/domain/models/tag.model.ts';

const ComboboxComponentTag = React.forwardRef<
    HTMLButtonElement,
    {
        tags: TagModel[];
        value?: number | null;
        onChange?: (value: number | null) => void;
        handleSetTag: (selectedTag: number | null) => void;
    }
>(({ tags = [], value, onChange, handleSetTag }, ref) => {
    const [open, setOpen] = React.useState(false);

    const selectedValue = value !== undefined && value !== null ? value.toString() : '';

    const handleSelect = (currentId: string) => {
        if (currentId === selectedValue) {
            handleSetTag(null);
            onChange?.(null);
        } else {
            handleSetTag(Number(currentId));
            onChange?.(Number(currentId));
        }
        setOpen(false);
    };

    const selectedName = tags.find((n) => n.id.toString() === selectedValue)?.name || 'Choisir un tag';

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    ref={ref}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
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
                            {tags.map((tag) => (
                                <CommandItem
                                    key={tag.id}
                                    value={tag.id.toString()}
                                    onSelect={() => handleSelect(tag.id.toString())}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            selectedValue === tag.id.toString() ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                    {tag.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
});

ComboboxComponentTag.displayName = 'ComboboxComponentTag';

export default ComboboxComponentTag;
