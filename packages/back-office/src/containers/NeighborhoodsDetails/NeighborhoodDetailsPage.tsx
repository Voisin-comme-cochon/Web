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
        selectedImage,
        setSelectedImage
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
        );
    }

    const statusText = neighborhood.status === NeighborhoodStatusEnum.PENDING ? 'En attente' :
        neighborhood?.status === NeighborhoodStatusEnum.ACCEPTED ? 'Accepté' :
            neighborhood?.status === NeighborhoodStatusEnum.REJECTED ? 'Refusé' : 'Statut inconnu';

    return (
        <div className="flex min-h-screen w-full">
            <SideHeader/>
            <main className="flex flex-col flex-1">
                <InfoHeader
                    title={neighborhood.name}
                    description={`Quartier créé le ${new Date(neighborhood.creationDate).toLocaleDateString()}, statut : ${statusText}`}
                />
                <div className="pl-4 pt-4 pr-4">
                    <h2 className="text-xl font-bold mb-2">Emplacement</h2>
                </div>
                {
                    neighborhood.geo ? (
                        <SimpleMapboxShape
                            mapboxToken={import.meta.env.VITE_VCC_MAPBOX_PUBLIC_KEY}
                            neighborhood={neighborhood}
                        />
                    ) : (
                        <p>Aucune géolocalisation disponible pour ce quartier.</p>
                    )
                }
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-2">Description</h2>
                    <p>{neighborhood.description}</p>
                </div>
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-2">Images</h2>
                    {neighborhood.images.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {neighborhood.images.map((image, index) => (
                                <div key={index}
                                     className="cursor-pointer w-full h-80 overflow-hidden rounded-lg shadow-md">
                                    <img
                                        src={image.url}
                                        alt={`Image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        onClick={() => setSelectedImage(image.url)}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Aucune image disponible pour ce quartier.</p>
                    )}
                </div>
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-2">Membres</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex items-center bg-gray-100 p-4 rounded-lg shadow-md">
                            <img src="" alt="Membre 1" className="w-12 h-12 rounded-full inline-block mr-2"/>
                            <p>Membre 1</p>
                        </div>
                        <div className="flex items-center bg-gray-100 p-4 rounded-lg shadow-md">
                            <img src="" alt="Membre 2" className="w-12 h-12 rounded-full inline-block mr-2"/>
                            <p>Membre 2</p>
                        </div>
                    </div>
                </div>
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-2">Actions</h2>
                    <div className="flex gap-4 justify-end">
                        <button
                            onClick={() => console.log('Quartier refusé')}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                            Refuser
                        </button>
                        <button
                            onClick={() => console.log('Quartier accepté')}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                            Accepter
                        </button>
                    </div>
                </div>

                {selectedImage && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                        onClick={() => setSelectedImage(null)}
                    >
                        <div
                            className="relative bg-white p-2 rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={"flex flex-row-reverse"}>
                                <button
                                    className="text-gray-700 hover:text-black text-3xl font-bold"
                                    onClick={() => setSelectedImage(null)}
                                >
                                    &times;
                                </button>
                            </div>
                            <img
                                src={selectedImage}
                                alt="Agrandie"
                                className="h-auto w-auto max-h-[90vh] max-w-[90vw] rounded"
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
