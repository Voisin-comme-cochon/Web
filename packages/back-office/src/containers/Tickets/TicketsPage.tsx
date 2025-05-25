import SideHeader from "@/components/SideHeader/SideHeader.tsx";
import InfoHeader from "@/components/InfoHeader/InfoHeader.tsx";
import {useTicketDataState} from "@/presentation/state/ticket-data.state.ts";
import {useFetchTicketData} from "@/presentation/hooks/fetch-ticket-data.ts";
import {h} from "gridjs";
import {useMemo} from "react";
import CustomGrid from "@/components/CustomGrid/CustomGrid.tsx";

export default function TicketsPage() {
    const {
        tickets,
        setTickets
    } = useTicketDataState();

    useFetchTicketData(setTickets);

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
            case 'resolved':
                iconName = 'check_circle';
                iconColor = 'green';
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

    const ticketData = useMemo(
        () => (tickets ?? []).map(t => [
            t.createdAt,
            t.subject,
            t.priority,
            t.status,
            t.id
        ]),
        [tickets]
    );

    const priorityFormatter = (cell: string) => {
        let iconName: string;
        let iconColor: string;

        switch (cell) {
            case 'high':
                iconName = 'arrow_upward';
                iconColor = 'green';
                break;
            case 'medium':
                iconName = 'remove';
                iconColor = '#E9B121';
                break;
            case 'low':
                iconName = 'arrow_downward';
                iconColor = 'red';
                break;
            default:
                iconName = 'help_outline';
                iconColor = 'gray';
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

    const neighborhoodColumns = useMemo(
        () => [
            {name: 'Date', className: 'font-bold text-center text-black', formatter: commonDateFormatter},
            {name: 'Sujet', className: 'font-bold text-center text-black'},
            {name: 'Priorité', className: 'font-bold text-center text-black', formatter: priorityFormatter},
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
                <InfoHeader title={"Tickets"} description={"Gérez les demandes d'assistance des utilisateurs"}/>
                <div className={"p-8"}>
                    <CustomGrid data={ticketData} columns={neighborhoodColumns} options={options}/>
                </div>
            </main>
        </div>
    );
}
