import React, {useMemo} from 'react';
import {h} from 'gridjs';
import SideHeader from '@/components/SideHeader/SideHeader';
import InfoHeader from '@/components/InfoHeader/InfoHeader';
import CustomGrid from '@/components/CustomGrid/CustomGrid';
import StatBloc from '@/components/StatBloc/StatBloc';
import {useFetchDashboardData} from "@/presentation/hooks/fetch-dashboard-data.ts";
import {useDashboardDataState} from "@/presentation/state/dashboard-data.state.ts";

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
    } = useDashboardDataState();

    useFetchDashboardData(setCreatedTickets, setOpenTickets, setResolvedTickets, setCreatedNeighborhood, setUsers, setEvents, setMessages, setSales)

    const columns = useMemo( // pour ne pas recréer à chaque render
        () => [
            'ID',
            {
                name: 'Nom',
                formatter: (cell: string | number) => h('strong', {}, cell),
            },
            'Statut',
            {
                name: 'Actions',
                attributes: {
                    style: 'width: 128px; min-width: 128px; text-align: center;',
                },
                formatter: (cell: number) =>
                    h(
                        'div',
                        {className: 'flex justify-center'}, // Centre le contenu dans la cellule
                        h(
                            'button',
                            {
                                className:
                                    'flex items-center gap-1 px-2 py-2 rounded border border-blue text-blue bg-white hover:bg-blue-50 transition-colors',
                                style: {cursor: 'pointer'},
                                title: 'Voir',
                                onClick: () => alert(`Détails de l'élément ${cell}`),
                            },
                            h('span', {className: 'material-icons', style: {fontSize: '18px'}}, 'edit'),
                        )
                    ),
            }

        ],
        []
    );

    // Données d'exemple
    const data = useMemo(
        () => [
            [1, 'Alice', 'En cours', 1],
            [2, 'Bob', 'Clôturé', 2],
            [3, 'Charlie', 'En attente', 3],
        ],
        []
    );

    const options = useMemo(
        () => ({
            search: false
        }), [])

    return (
        <div className="flex min-h-screen w-full">
            <SideHeader/>
            <main className="flex flex-col flex-1">
                <InfoHeader
                    title="Tableau de bord"
                    description="Bienvenue sur le tableau de bord"
                />
                <div className="p-8">
                    <div className="mb-16 grid grid-cols-4 gap-4">
                        <StatBloc
                            iconId="confirmation_number"
                            title="Tickets créés"
                            value={
                                createdTickets ? createdTickets : 0
                            }
                            color="#507DBC"
                        />
                        <StatBloc
                            iconId="pace"
                            title="Tickets en attente"
                            value={openTickets}
                            color="#FF0000"
                        />
                        <StatBloc
                            iconId="check"
                            title="Tickets résolus"
                            value={resolvedTickets}
                            color="#E9B121"
                        />
                        <StatBloc
                            iconId="add_business"
                            title="Quartiers créés"
                            value={createdNeighborhood}
                            color="#ED5C3B"
                        />

                        <StatBloc
                            iconId="group"
                            title="Utilisateurs"
                            value={users}
                            color="#E04040"
                        />
                        <StatBloc
                            iconId="calendar_today"
                            title="Évènements créés"
                            value={events}
                            color="#59ACD0"
                        />
                        <StatBloc
                            iconId="chat"
                            title="Messages envoyés"
                            value={messages}
                            color="#C19871"
                        />
                        <StatBloc
                            iconId="sell"
                            title="Matériels vendus"
                            value={sales}
                            color="#67BB34"
                        />
                    </div>
                    <div className={"w-full flex flex-row space-between gap-4"}>
                        <div>
                            <label className={"mb-2 font-bold"}>Quartiers en attente</label>
                            <CustomGrid columns={columns} data={data} options={options}/>
                        </div>
                        <div>
                            <label className={" font-bold"}>Tickets en attente</label>
                            <CustomGrid columns={columns} data={data} options={options}/>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
