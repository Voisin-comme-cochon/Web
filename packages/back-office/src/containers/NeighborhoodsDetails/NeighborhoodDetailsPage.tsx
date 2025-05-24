import SideHeader from "@/components/SideHeader/SideHeader.tsx";
import InfoHeader from "@/components/InfoHeader/InfoHeader.tsx";
import {useNeighborhoodDetailsState} from "@/presentation/state/neighborhood-details.state.ts";
import {useGetNeighborhoodById} from "@/presentation/hooks/use-get-neighborhood-by-id.ts";
import {NeighborhoodStatusEnum} from "@/domain/models/neighborhood-status.enum.ts";
import {SimpleMapboxShape} from "@/components/NeighborhoodMap/NeighborhoodMap.tsx";

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

    const statusText = neighborhood.status === NeighborhoodStatusEnum.PENDING ? 'En attente' :
        neighborhood?.status === NeighborhoodStatusEnum.ACCEPTED ? 'Accepté' :
            neighborhood?.status === NeighborhoodStatusEnum.REJECTED ? 'Refusé' : 'Statut inconnu';
    
    return (
        <div className="flex min-h-screen w-full">
            <SideHeader/>
            <main className="flex flex-col flex-1">
                <InfoHeader title={neighborhood.name}
                            description={`Quartier créé le ${new Date(neighborhood.creationDate).toLocaleDateString()}, statut : ${statusText}`}/>
                {
                    neighborhood.geo &&
                        <SimpleMapboxShape
                        mapboxToken={import.meta.env.VITE_VCC_MAPBOX_PUBLIC_KEY}
                        coordinates={neighborhood.geo.coordinates}
                    />
            }
            </main>
        </div>
    );
}
