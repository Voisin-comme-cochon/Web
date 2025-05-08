import StatBloc from "@/components/StatBloc/StatBloc";
import SideHeader from "@/components/SideHeader/SideHeader.tsx";
import InfoHeader from "@/components/InfoHeader/InfoHeader.tsx";
import CustomGrid from "@/components/CustomGrid/CustomGrid.tsx";

export default function Dashboard() {
    return (
        <div className="flex min-h-screen w-full">
            <SideHeader/>
            <main className="flex flex-col flex-1">
                <InfoHeader title={"Tableau de bord"} description={"Bienvenue sur le tableau de bord"}/>
                <div className={"p-8"}>
                    <div className={"mb-4"}>
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <StatBloc iconId="confirmation_number" title="Tickets en cours" value={128}
                                      color="#507DBC"/>
                            <StatBloc iconId="pace" title="Tickets en attente" value={128} color="#FF0000"/>
                            <StatBloc iconId="check" title="Tickets cloturés" value={128} color="#E9B121"/>
                            <StatBloc iconId="add_business" title="Quartiers créés" value={128} color="#ED5C3B"/>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <StatBloc iconId="group" title="Utilisateurs" value={128} color="#E04040"/>
                            <StatBloc iconId="calendar_today" title="Évènements cette semaine" value={128}
                                      color="#59ACD0"/>
                            <StatBloc iconId="chat" title="Messages envoyés" value={128} color="#C19871"/>
                            <StatBloc iconId="sell" title="Matériels vendus" value={128} color="#67BB34"/>
                        </div>
                    </div>
                    <CustomGrid/>
                </div>
            </main>
        </div>
    );
}
