import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MapPin } from 'lucide-react';

interface AddressSuggestion {
    label: string;
    address: string;
    city: string;
    postcode: string;
    coordinates: [number, number];
}

interface AddressAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    onAddressSelect?: (address: AddressSuggestion) => void;
}

export function AddressAutocomplete({
    value,
    onChange,
    placeholder = 'Tapez votre adresse...',
    disabled = false,
    onAddressSelect,
}: AddressAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout>();

    const searchAddress = async (query: string): Promise<AddressSuggestion[]> => {
        if (query.length < 3) return [];

        try {
            const response = await fetch(
                `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
            );

            if (!response.ok) {
                throw new Error("Erreur lors de la recherche d'adresse");
            }

            const data = await response.json();

            return data.features.map((feature: any) => ({
                label: feature.properties.label,
                address: feature.properties.name || '',
                city: feature.properties.city || '',
                postcode: feature.properties.postcode || '',
                coordinates: feature.geometry.coordinates as [number, number],
            }));
        } catch (error) {
            console.error('Erreur recherche adresse:', error);
            return [];
        }
    };

    const handleInputChange = (inputValue: string) => {
        onChange(inputValue);

        // Clear existing debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Debounce the search
        debounceRef.current = setTimeout(async () => {
            if (inputValue.length >= 3) {
                setIsLoading(true);
                const results = await searchAddress(inputValue);
                setSuggestions(results);
                setIsOpen(results.length > 0);
                setIsLoading(false);
            } else {
                setSuggestions([]);
                setIsOpen(false);
            }
        }, 300);
    };

    const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
        onChange(suggestion.label);
        setSuggestions([]);
        setIsOpen(false);

        // Callback pour traitement additionnel si nécessaire
        if (onAddressSelect) {
            onAddressSelect(suggestion);
        }
    };

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div className="relative">
                    <Input
                        value={value}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder={placeholder}
                        disabled={disabled}
                        className="pr-10"
                    />
                    <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
            </PopoverTrigger>

            <PopoverContent className="w-full p-0" align="start">
                <Command>
                    <CommandList>
                        {isLoading && <CommandEmpty>Recherche en cours...</CommandEmpty>}

                        {!isLoading && suggestions.length === 0 && value.length >= 3 && (
                            <CommandEmpty>Aucune adresse trouvée</CommandEmpty>
                        )}

                        {suggestions.length > 0 && (
                            <CommandGroup>
                                {suggestions.map((suggestion, index) => (
                                    <CommandItem
                                        key={index}
                                        value={suggestion.label}
                                        onSelect={() => handleSuggestionSelect(suggestion)}
                                        className="cursor-pointer"
                                    >
                                        <MapPin className="mr-2 h-4 w-4" />
                                        <div className="flex flex-col">
                                            <span className="font-medium">{suggestion.address}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {suggestion.postcode} {suggestion.city}
                                            </span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
