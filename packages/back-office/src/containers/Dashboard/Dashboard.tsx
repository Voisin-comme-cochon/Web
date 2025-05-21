import {useMemo} from 'react';
import {h} from 'gridjs';
import SideHeader from '@/components/SideHeader/SideHeader';
import InfoHeader from '@/components/InfoHeader/InfoHeader';
import CustomGrid from '@/components/CustomGrid/CustomGrid';
import StatBloc from '@/components/StatBloc/StatBloc';
import {useFetchDashboardData} from '@/presentation/hooks/fetch-dashboard-data.ts';
import {useDashboardDataState} from '@/presentation/state/dashboard-data.state.ts';
import './styles.css';

const formatDate = (cell) => {
    const d = new Date(cell);
    return h('span', {}, d.toLocaleDateString('fr-FR', {year: 'numeric', month: '2-digit', day: '2-digit'}));
};

const statusIcon = (expected) => (cell) =>
    cell === expected
        ? h(
            'span',
            {
                className: 'material-icons',
                style: {
                    color: '#E9B121',
                    fontSize: '24px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                },
            },
            'schedule'
        )
        : cell;

const actionCell = (cell) =>
    h(
        'div',
        {className: 'flex justify-center'},
        h(
            'button',
            {
                className: 'flex items-center gap-1 px-2 py-2 rounded border border-blue text-blue bg-white hover:bg-blue-50 transition-colors',
                style: {cursor: 'pointer'},
                title: 'Voir',
                onClick: () => alert(`Détails de l'élément ${cell}`),
            },
            h('span', {className: 'material-icons', style: {fontSize: '18px'}}, 'edit')
        )
    );

const createColumns = (label, status) => [
    {name: 'Date', formatter: formatDate, className: 'font-bold text-center text-black'},
    {name: label, className: 'font-bold text-center text-black'},
    {name: 'Statut', formatter: statusIcon(status), className: 'font-bold text-center text-black'},
    {
        name: 'Actions',
        formatter: actionCell,
        className: 'font-bold text-center text-black',
        attributes: {style: 'width:128px;min-width:128px'},
    },
];

const createOptions = ({endpoint, dateKey}) => ({
    search: false,
    pagination: {enabled: true, limit: 5},
    server: {
        url: `${import.meta.env.VITE_VCC_API_URL}/${endpoint}`,
        headers: {Authorization: `Bearer ${localStorage.getItem('jwt')}`},
        then: (data) =>
            data.data.map((item) => [item[dateKey], item.name || item.subject, item.status]),
        total: (data) => data.metadata.totalCount,
    },
    className: {thead: 'custom-header'},
});

const Dashboard = () => {
    const state = useDashboardDataState();
    useFetchDashboardData(
        state.setCreatedTickets,
        state.setOpenTickets,
        state.setResolvedTickets,
        state.setCreatedNeighborhood,
        state.setUsers,
        state.setEvents,
        state.setMessages,
        state.setSales
    );

    const grids = useMemo(
        () => [
            {
                label: 'Quartier',
                status: 'waiting',
                endpoint: 'neighborhoods?status=waiting',
                dateKey: 'creationDate',
                columns: createColumns('Nom du quartier', 'waiting'),
            },
            {
                label: 'Ticket',
                status: 'open',
                endpoint: 'tickets?status=open',
                dateKey: 'createdAt',
                columns: createColumns('Sujet', 'open'),
            },
        ],
        []
    );

    const stats = [
        {icon: 'confirmation_number', title: 'Tickets créés', value: state.createdTickets, color: '#507DBC'},
        {icon: 'pace', title: 'Tickets en attente', value: state.openTickets, color: '#FF0000'},
        {icon: 'check', title: 'Tickets résolus', value: state.resolvedTickets, color: '#E9B121'},
        {icon: 'add_business', title: 'Quartiers créés', value: state.createdNeighborhood, color: '#ED5C3B'},
        {icon: 'group', title: 'Utilisateurs', value: state.users, color: '#E04040'},
        {icon: 'calendar_today', title: 'Évènements créés', value: state.events, color: '#59ACD0'},
        {icon: 'chat', title: 'Messages envoyés', value: state.messages, color: '#C19871'},
        {icon: 'sell', title: 'Matériels vendus', value: state.sales, color: '#67BB34'},
    ];

    return (
        <div className="flex min-h-screen w-full">
            <SideHeader/>
            <main className="flex flex-col flex-1">
                <InfoHeader title="Tableau de bord" description="Bienvenue sur le tableau de bord"/>
                <div className="p-8">
                    <div className="mb-16 grid grid-cols-4 gap-4">
                        {stats.map(({icon, title, value, color}) => (
                            <StatBloc key={title} iconId={icon} title={title} value={value || 0} color={color}/>
                        ))}
                    </div>
                    <div className="w-full flex gap-4">
                        {grids.map(({label, columns, endpoint, dateKey}) => (
                            <div key={endpoint} className="flex-1">
                                <label className="mb-2 font-bold">{label}s en attente</label>
                                <CustomGrid columns={columns} options={createOptions({endpoint, dateKey})}/>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
