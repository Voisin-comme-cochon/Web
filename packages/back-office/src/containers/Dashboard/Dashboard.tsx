import StatBloc from "@/components/StatBloc/StatBloc";

export default function Dashboard() {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-2">Tableau de bord</h1>
            <p className="mb-4">Bienvenue sur le tableau de bord.</p>

            <div className={"flex items-center p-0"}>
                <StatBloc iconId="confirmation_number" title="Tickets en cours" value={128} color="#507DBC"/>
                <StatBloc iconId="pace" title="Tickets en attente" value={128} color="#FF0000"/>
                <StatBloc iconId="check" title="Tickets cloturés" value={128} color="#E9B121"/>
                <StatBloc iconId="add_business" title="Quartiers créés" value={128} color="#ED5C3B"/>
            </div>
            <div className={"flex items-center p-0"}>
                <StatBloc iconId="group" title="Utilisateurs" value={128} color="#E04040"/>
                <StatBloc iconId="calendar_today" title="Évènements cette semaine" value={128} color="#59ACD0"/>
                <StatBloc iconId="chat" title="Messages envoyés" value={128} color="#C19871"/>
                <StatBloc iconId="sell" title="Materiels vendus" value={128} color="#67BB34"/>
            </div>
        </div>
    );
}
