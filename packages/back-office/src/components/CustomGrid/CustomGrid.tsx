// src/components/CustomGrid/CustomGrid.tsx
import React, {memo, useEffect, useRef} from 'react';
import {Grid} from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';

type GridConfig = ConstructorParameters<typeof Grid>[0];

export interface CustomGridProps {
    /** Colonnes (string ou objet avec formatter React) */
    columns: Array<
        | string
        | {
        name: string;
        formatter?: (cell: string | number) => React.JSX.Element;
    }
    >;
    /** Toutes les options Grid.js sauf `columns` et `data` (on les injecte nous‐mêmes) */
    options?: Omit<GridConfig, 'columns'>;
}

const CustomGrid: React.FC<CustomGridProps> = ({columns, options}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const config: GridConfig = {
            columns,
            // Valeurs par défaut
            search: true,
            sort: true,
            pagination: {limit: 10},
            // Ici soit on rajoute ou on remplace celle dessus
            ...options,
        };

        const grid = new Grid(config);
        grid.render(containerRef.current);

        return () => {
            grid.destroy();
        };
    }, [columns, options]);

    return <div ref={containerRef}/>;
};

export default memo(CustomGrid);
