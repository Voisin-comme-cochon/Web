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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    options?: Omit<GridConfig, 'columns' | 'data'>;
}

const CustomGrid: React.FC<CustomGridProps> = ({columns, data = [], options = {}}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const config: GridConfig = {
            columns,
            data: Array.isArray(data) ? data : [],
            search: true,
            sort: true,
            pagination: {limit: 10},
            ...options,
        };

        const grid = new Grid(config);
        grid.render(containerRef.current);

        return () => {
            grid.destroy();
        };
    }, [columns, data, options]);

    return <div ref={containerRef}/>;
};

export default memo(CustomGrid);
