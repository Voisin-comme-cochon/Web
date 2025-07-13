import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ItemAvailabilityStatus } from '@/domain/models/item.model';

interface FilterBarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    selectedCategory: string;
    onCategoryChange: (value: string) => void;
    selectedStatus: string;
    onStatusChange: (value: string) => void;
    onClearFilters: () => void;
    loading?: boolean;
}

const CATEGORIES = [
    'Électroménager',
    'Outils',
    'Jardinage',
    'Sport',
    'Cuisine',
    'Décoration',
    'Informatique',
    'Véhicules',
    'Livres',
    'Jouets',
    'Autre'
];

const STATUS_OPTIONS = [
    { value: ItemAvailabilityStatus.AVAILABLE, label: 'Disponible' },
    { value: ItemAvailabilityStatus.UNAVAILABLE, label: 'Non disponible' },
    { value: ItemAvailabilityStatus.PARTIALLY_BOOKED, label: 'Partiellement réservé' }
];

const FilterBar = React.memo(function FilterBar({
    searchTerm,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    selectedStatus,
    onStatusChange,
    onClearFilters,
    loading = false
}: FilterBarProps) {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const hasActiveFilters = searchTerm || (selectedCategory && selectedCategory !== 'all') || (selectedStatus && selectedStatus !== 'all');
    
    useEffect(() => {
        if (searchInputRef.current && document.activeElement === searchInputRef.current) {
            return;
        }
    }, [searchTerm]);

    return (
        <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-gray-600">
                    tune
                </span>
                <h3 className="font-medium">Filtrer les objets</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                        search
                    </span>
                    <Input
                        ref={searchInputRef}
                        placeholder="Rechercher un objet..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10"
                        autoComplete="off"
                    />
                </div>

                <Select
                    value={selectedCategory}
                    onValueChange={onCategoryChange}
                    disabled={loading}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes les catégories</SelectItem>
                        {CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                                {category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={selectedStatus}
                    onValueChange={onStatusChange}
                    disabled={loading}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                                {status.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    onClick={onClearFilters}
                    disabled={!hasActiveFilters || loading}
                    className="w-full"
                >
                    <span className="material-symbols-outlined text-sm mr-2">
                        clear_all
                    </span>
                    Effacer
                </Button>
            </div>

            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <span className="text-sm text-gray-600">Filtres actifs :</span>
                    {searchTerm && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            <span className="material-symbols-outlined text-xs">search</span>
                            "{searchTerm}"
                        </span>
                    )}
                    {selectedCategory && selectedCategory !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            <span className="material-symbols-outlined text-xs">category</span>
                            {selectedCategory}
                        </span>
                    )}
                    {selectedStatus && selectedStatus !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            <span className="material-symbols-outlined text-xs">visibility</span>
                            {STATUS_OPTIONS.find(s => s.value === selectedStatus)?.label}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
});

export default FilterBar;