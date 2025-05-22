import SideHeader from "@/components/SideHeader/SideHeader.tsx";
import InfoHeader from "@/components/InfoHeader/InfoHeader.tsx";
import CustomGrid from "@/components/CustomGrid/CustomGrid.tsx";
import {useMemo} from "react";
import {useNeighborhoodDataState} from "@/presentation/state/neighborhood-data.state.ts";
import {h} from "gridjs";
import {useFetchNeighborhoodData} from "@/presentation/hooks/fetch-neighborhood-data.ts";

export default function NeighborhoodPage() {
    const {
        neighborhoods,
        setNeighborhoods
    } = useNeighborhoodDataState();

    useFetchNeighborhoodData(setNeighborhoods);

    const commonDateFormatter = (cell: string | number) => {
        const date = new Date(cell as string);
        return h(
            'span',
            {},
            date.toLocaleDateString('fr-FR', {year: 'numeric', month: '2-digit', day: '2-digit'})
        );
    };

    // Formatter for status column: check for accepted, cross for refused, fallback to waiting
    const statusFormatter = (cell: string) => {
        let iconName: string;
        let iconColor: string;

        switch (cell) {
            case 'accepted':
                iconName = 'check_circle';
                iconColor = 'green';
                break;
            case 'refused':
                iconName = 'cancel';
                iconColor = 'red';
                break;
            default:
                iconName = 'schedule';
                iconColor = '#E9B121';
        }

        return h(
            'span',
            {
                className: 'material-icons',
                style: {
                    color: iconColor,
                    fontSize: '24px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }
            },
            iconName
        );
    };

    const actionFormatter = (cell: string | number) =>
        h('div', {className: 'flex justify-center'},
            h('button', {
                    className: 'flex items-center gap-1 px-2 py-2 rounded border border-blue text-blue bg-white hover:bg-blue-50 transition-colors',
                    style: {cursor: 'pointer'},
                    title: 'Voir',
                    onClick: () => alert(`Détails de l'élément ${cell}`),
                },
                h('span', {className: 'material-icons', style: {fontSize: '18px'}}, 'edit')
            )
        );

    const neighborhoodsData = useMemo(
        () => (neighborhoods ?? []).map(n => [
            n.creationDate,
            n.name,
            n.description,
            n.status,
            n.id
        ]),
        [neighborhoods]
    );

    const neighborhoodColumns = useMemo(
        () => [
            {name: 'Date', className: 'font-bold text-center text-black', formatter: commonDateFormatter},
            {name: 'Nom du quartier', className: 'font-bold text-center text-black'},
            {name: 'Description', className: 'font-bold text-center text-black'},
            {name: 'Statut', className: 'font-bold text-center text-black', formatter: statusFormatter},
            {
                name: 'Actions',
                className: 'font-bold text-center text-black',
                attributes: {style: 'width: 128px; min-width: 128px;'},
                formatter: actionFormatter
            },
        ],
        []
    );

    const options = useMemo(
        () => ({
            search: true,
            pagination: {enabled: true, limit: 5},
            className: {thead: 'custom-header'},
        }),
        []
    );

    return (
        <div className="flex min-h-screen w-full">
            <SideHeader/>
            <main className="flex flex-col flex-1">
                <InfoHeader title={"Quartiers"} description={"Gérez, acceptez ou refusez les quartiers"}/>
                <div className={"p-8"}>
                    <CustomGrid data={neighborhoodsData} columns={neighborhoodColumns} options={options}/>
                </div>
            </main>
        </div>
    );
}
