import React, {useMemo} from 'react';
import {h} from 'gridjs';
import SideHeader from '@/components/SideHeader/SideHeader';
import InfoHeader from '@/components/InfoHeader/InfoHeader';
import CustomGrid from '@/components/CustomGrid/CustomGrid';
import StatBloc from '@/components/StatBloc/StatBloc';

const Dashboard: React.FC = () => {
    type CellValue = string | number | React.ReactNode;

    const columns = useMemo( // pour ne pas recréer à chaque render
        () => [
            'ID',
            {
                name: 'Nom',
                formatter: (cell: CellValue) => h('strong', {}, cell),
            },
            'Statut',
            {
                name: 'Actions',
                formatter: cell =>
                    h(
                        'button',
                        {
                            className: 'px-2 py-1 rounded bg-blue text-black',
                            onClick: () => alert(`Détails de l'élément ${cell}`),
                        },
                        'Voir'
                    ),
            },
        ],
        []
    );

    // Données d'exemple
    const data: CellValue[][] = useMemo(
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
                            title="Tickets en cours"
                            value={128}
                            color="#507DBC"
                        />
                        <StatBloc
                            iconId="pace"
                            title="Tickets en attente"
                            value={128}
                            color="#FF0000"
                        />
                        <StatBloc
                            iconId="check"
                            title="Tickets cloturés"
                            value={128}
                            color="#E9B121"
                        />
                        <StatBloc
                            iconId="add_business"
                            title="Quartiers créés"
                            value={128}
                            color="#ED5C3B"
                        />

                        <StatBloc
                            iconId="group"
                            title="Utilisateurs"
                            value={128}
                            color="#E04040"
                        />
                        <StatBloc
                            iconId="calendar_today"
                            title="Évènements cette semaine"
                            value={128}
                            color="#59ACD0"
                        />
                        <StatBloc
                            iconId="chat"
                            title="Messages envoyés"
                            value={128}
                            color="#C19871"
                        />
                        <StatBloc
                            iconId="sell"
                            title="Matériels vendus"
                            value={128}
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
