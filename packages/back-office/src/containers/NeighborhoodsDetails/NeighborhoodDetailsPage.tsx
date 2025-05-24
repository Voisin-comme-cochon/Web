import SideHeader from "@/components/SideHeader/SideHeader.tsx";
import InfoHeader from "@/components/InfoHeader/InfoHeader.tsx";
import {useNeighborhoodDetailsState} from "@/presentation/state/neighborhood-details.state.ts";
import {useGetNeighborhoodById} from "@/presentation/hooks/use-get-neighborhood-by-id.ts";

export default function NeighborhoodDetailsPage() {
    const {
        neighborhood,
        setNeighborhood,
    } = useNeighborhoodDetailsState();

    useGetNeighborhoodById(setNeighborhood);

    if (!neighborhood) {
        return (
            <div className="flex min-h-screen w-full">
                <SideHeader/>
                <main className="flex flex-col flex-1">
                    <InfoHeader title={"Nom du quartier"} description={"Description du quartier"}/>
                    <div className="flex h-full w-full items-center justify-center">
                        <p>Chargement...</p>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full">
            <SideHeader/>
            <main className="flex flex-col flex-1">
                <InfoHeader title={"Quartiers"} description={"Gérez, acceptez ou refusez les quartiers"}/>
            </main>
        </div>
    );
}
