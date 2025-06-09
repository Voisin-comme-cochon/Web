import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
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
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const debounceRef = useRef<NodeJS.Timeout>();
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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
        setHighlightedIndex(-1);

        // Maintenir le focus sur l'input
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);

        // Callback pour traitement additionnel si nécessaire
        if (onAddressSelect) {
            onAddressSelect(suggestion);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                    handleSuggestionSelect(suggestions[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
        }
    };

    // Gérer les clics en dehors
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative">
                <Input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0) {
                            setIsOpen(true);
                        }
                    }}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="pr-10"
                    autoComplete="off"
                />
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                    {isLoading && <div className="px-3 py-2 text-sm text-muted-foreground">Recherche en cours...</div>}

                    {!isLoading && suggestions.length === 0 && value.length >= 3 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">Aucune adresse trouvée</div>
                    )}

                    {suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-start gap-2 ${
                                index === highlightedIndex ? 'bg-gray-100' : ''
                            }`}
                            onMouseDown={(e) => {
                                // Prévenir la perte de focus
                                e.preventDefault();
                            }}
                            onClick={() => handleSuggestionSelect(suggestion)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                        >
                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <div className="flex flex-col min-w-0">
                                <span className="font-medium text-sm truncate">{suggestion.address}</span>
                                <span className="text-xs text-muted-foreground">
                                    {suggestion.postcode} {suggestion.city}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
