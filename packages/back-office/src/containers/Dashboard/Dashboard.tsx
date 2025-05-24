import React, {useMemo} from 'react';
import {h} from 'gridjs';
import SideHeader from '@/components/SideHeader/SideHeader';
import InfoHeader from '@/components/InfoHeader/InfoHeader';
import CustomGrid from '@/components/CustomGrid/CustomGrid';
import StatBloc from '@/components/StatBloc/StatBloc';
import {useFetchDashboardData} from "@/presentation/hooks/fetch-dashboard-data.ts";
import {useDashboardDataState} from "@/presentation/state/dashboard-data.state.ts";
import "./styles.css";
import {useAppNavigation} from "@/presentation/state/navigate.state.ts";

const Dashboard: React.FC = () => {
    const {
        createdTickets,
        setCreatedTickets,
        setOpenTickets,
        openTickets,
        setResolvedTickets,
        resolvedTickets,
        setCreatedNeighborhood,
        createdNeighborhood,
        setUsers,
        users,
        setEvents,
        events,
        setMessages,
        messages,
        setSales,
        sales,
        setNeighborhoods,
        neighborhoods,
        setTickets,
        tickets,
    } = useDashboardDataState();
    const {goNeighborhoodDetail} = useAppNavigation();
    useFetchDashboardData(
        setCreatedTickets, setOpenTickets, setResolvedTickets, setCreatedNeighborhood,
        setUsers, setEvents, setMessages, setSales, setTickets, setNeighborhoods
    );

    const commonDateFormatter = (cell: string | number) => {
        const date = new Date(cell);
        return h('span', {}, date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }));
    };

    const statusFormatter = (expectedValue: string) => (cell: string) =>
        cell === expectedValue
            ? h('span', {
                className: 'material-icons',
                style: {
                    color: '#E9B121',
                    fontSize: '24px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }
            }, 'schedule')
            : cell;

    const actionNeighborhoodFormatter = (cell: string | number) =>
        h('div', {className: 'flex justify-center'},
            h('button', {
                    className: 'flex items-center gap-1 px-2 py-2 rounded border border-blue text-blue bg-white hover:bg-blue-50 transition-colors',
                    style: {cursor: 'pointer'},
                    title: 'Voir',
                    onClick: () => goNeighborhoodDetail(cell),
                },
                h('span', {className: 'material-icons', style: {fontSize: '18px'}}, 'edit')
            )
        );

    const actionTicketFormatter = (cell: string | number) =>
        h('div', {className: 'flex justify-center'},
            h('button', {
                    className: 'flex items-center gap-1 px-2 py-2 rounded border border-blue text-blue bg-white hover:bg-blue-50 transition-colors',
                    style: {cursor: 'pointer'},
                    title: 'Voir',
                    onClick: () => alert(cell),
                },
                h('span', {className: 'material-icons', style: {fontSize: '18px'}}, 'edit')
            )
        );


    const neighborhoodColumns = useMemo(() => [
        {name: 'Date', className: 'font-bold text-center text-black', formatter: commonDateFormatter},
        {name: 'Nom du quartier', className: 'font-bold text-center text-black'},
        {name: 'Statut', className: 'font-bold text-center text-black', formatter: statusFormatter('waiting')},
        {
            name: 'Actions',
            className: 'font-bold text-center text-black',
            attributes: {style: 'width: 128px; min-width: 128px;'},
            formatter: actionNeighborhoodFormatter
        },
    ], []);

    const ticketsColumns = useMemo(() => [
        {name: 'Date', className: 'font-bold text-center text-black', formatter: commonDateFormatter},
        {name: 'Sujet', className: 'font-bold text-center text-black'},
        {name: 'Statut', className: 'font-bold text-center text-black', formatter: statusFormatter('open')},
        {
            name: 'Actions',
            className: 'font-bold text-center text-black',
            attributes: {style: 'width: 128px; min-width: 128px;'},
            formatter: actionTicketFormatter
        },
    ], []);

    const options = useMemo(() => ({
        search: false,
        pagination: {enabled: true, limit: 5},
        className: {thead: 'custom-header'},
    }), []);

    // Ajout : mapping des données pour CustomGrid
    const neighborhoodsData = useMemo(() =>
            (neighborhoods ?? []).map(n => [
                n.creationDate,
                n.name,
                n.status,
                n.id // ou autre identifiant/action
            ])
        , [neighborhoods]);

    const ticketsData = useMemo(() =>
            (tickets ?? []).map(t => [
                t.createdAt,
                t.subject,
                t.status,
                t.id // ou autre identifiant/action
            ])
        , [tickets]);

    return (
        <div className="flex min-h-screen w-full">
            <SideHeader/>
            <main className="flex flex-col flex-1">
                <InfoHeader title="Tableau de bord" description="Bienvenue sur le tableau de bord"/>
                <div className="p-8">
                    <div className="mb-16 grid grid-cols-4 gap-4">
                        <StatBloc iconId="confirmation_number" title="Tickets créés" value={createdTickets || 0}
                                  color="#507DBC"/>
                        <StatBloc iconId="pace" title="Tickets en attente" value={openTickets} color="#FF0000"/>
                        <StatBloc iconId="check" title="Tickets résolus" value={resolvedTickets} color="#E9B121"/>
                        <StatBloc iconId="add_business" title="Quartiers créés" value={createdNeighborhood}
                                  color="#ED5C3B"/>
                        <StatBloc iconId="group" title="Utilisateurs" value={users} color="#E04040"/>
                        <StatBloc iconId="calendar_today" title="Évènements créés" value={events} color="#59ACD0"/>
                        <StatBloc iconId="chat" title="Messages envoyés" value={messages} color="#C19871"/>
                        <StatBloc iconId="sell" title="Matériels vendus" value={sales} color="#67BB34"/>
                    </div>
                    <div className="w-full flex flex-row space-between gap-4">
                        <div>
                            <label className="mb-2 font-bold">Quartiers en attente</label>
                            <CustomGrid data={neighborhoodsData} columns={neighborhoodColumns} options={options}/>
                        </div>
                        <div>
                            <label className="font-bold">Tickets en attente</label>
                            <CustomGrid data={ticketsData} columns={ticketsColumns} options={options}/>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
