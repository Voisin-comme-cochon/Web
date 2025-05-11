import SideHeader from "@/components/SideHeader/SideHeader.tsx";
import InfoHeader from "@/components/InfoHeader/InfoHeader.tsx";

export default function TicketsPage() {
    return (
        <div className="flex min-h-screen w-full">
            <SideHeader/>
            <main className="flex flex-col flex-1">
                <InfoHeader title={"Tickets"} description={"Gérez les demandes d'assistance des utilisateurs"}/>
                <div className={"p-8"}>
                    <p>
                        Page de gestion des tickets
                    </p>
                </div>
            </main>
        </div>
    );
}
