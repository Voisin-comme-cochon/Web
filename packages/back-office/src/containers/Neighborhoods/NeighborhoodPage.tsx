import SideHeader from "@/components/SideHeader/SideHeader.tsx";
import InfoHeader from "@/components/InfoHeader/InfoHeader.tsx";

export default function NeighborhoodPage() {
    return (
        <div className="flex min-h-screen w-full">
            <SideHeader/>
            <main className="flex flex-col flex-1">
                <InfoHeader title={"Quartiers"} description={"Gérez, acceptez ou refusez les quartiers"}/>
                <div className={"p-8"}>
                    <p>
                        Page de gestion des quartiers
                    </p>
                </div>
            </main>
        </div>
    );
}
