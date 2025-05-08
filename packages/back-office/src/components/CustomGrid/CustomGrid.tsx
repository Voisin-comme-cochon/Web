import {Grid} from "gridjs";
import "gridjs/dist/theme/mermaid.css";
import {useEffect, useRef} from "react";

export default function CustomGrid() {
    const wrapperRef = useRef(null);

    useEffect(() => {
        const grid = new Grid({
            columns: ['Name', 'Email', 'Phone Number'],
            data: [
                ['John', 'john@example.com', '(353) 01 222 3333'],
                ['Mark', 'mark@gmail.com', '(01) 22 888 4444']
            ]
        });

        if (wrapperRef.current) {
            grid.render(wrapperRef.current);
        }
    }, []);

    return <div ref={wrapperRef}/>;
}
