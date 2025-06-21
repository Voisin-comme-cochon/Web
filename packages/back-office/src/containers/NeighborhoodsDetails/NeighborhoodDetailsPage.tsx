import SideHeader from "@/components/SideHeader/SideHeader.tsx";
import InfoHeader from "@/components/InfoHeader/InfoHeader.tsx";
import {useNeighborhoodDetailsState} from "@/presentation/state/neighborhood-details.state.ts";
import {useGetNeighborhoodById} from "@/presentation/hooks/use-get-neighborhood-by-id.ts";
import {NeighborhoodStatusEnum} from "@/domain/models/neighborhood-status.enum.ts";
import {SimpleMapboxShape} from "@/components/NeighborhoodMap/NeighborhoodMap.tsx";
import {useGetUsersByNeighborhood} from "@/presentation/hooks/use-get-users-by-neighborhood.ts";
import {NeighborhoodDetailsUseCase} from "@/domain/use-cases/neighborhood-details.uc.ts";
import NeighborhoodActionDialog from "@/components/NeighborhoodActionDialog/NeighborhoodActionDialog.tsx";

export default function NeighborhoodDetailsPage() {
    const {
        neighborhood,
        setNeighborhood,
        selectedImage,
        setSelectedImage,
        members,
        setMembers
    } = useNeighborhoodDetailsState();

    const setNeighborhoodStatusWithReason = async (status: NeighborhoodStatusEnum, reason?: string) => {
        const neighborhoodDetailsUseCase = new NeighborhoodDetailsUseCase();
        await neighborhoodDetailsUseCase.setNeighborhoodStatusUc(neighborhood?.id ?? '', status, reason ?? null);
        window.location.href = '/neighborhoods';
    }

    useGetNeighborhoodById(setNeighborhood);
    useGetUsersByNeighborhood(setMembers);

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
                        {
                            members && members.length > 0 ? (
                                members.map((member) => (
                                    <div key={member.id}
                                         className="flex items-center bg-gray-100 p-4 rounded-lg shadow-md">
                                        {
                                            member.profileImageUrl != null ? (
                                                <img src={member.profileImageUrl ?? undefined} alt="photo de profil"
                                                     onClick={() => setSelectedImage(member.profileImageUrl ?? '')}
                                                     className="w-12 h-12 rounded-full inline-block mr-2 cursor-pointer"/>
                                            ) : (
                                                <span className="material-symbols-outlined text-gray-400 text-3xl mr-2">
                                                    person
                                                </span>
                                            )
                                        }
                                        <p>{member.firstName} {member.lastName}</p>
                                    </div>
                                ))
                            ) : (
                                <p>Aucun membre trouvé pour ce quartier.</p>
                            )
                        }
                    </div>
                </div>
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-2">Actions</h2>
                    <div className="flex gap-4 justify-end">
                        {
                            neighborhood.status == NeighborhoodStatusEnum.PENDING ? (
                                <>
                                    <NeighborhoodActionDialog
                                        actionLabel="Refuser"
                                        status={NeighborhoodStatusEnum.REJECTED}
                                        requireReason
                                        onConfirm={(reason) => setNeighborhoodStatusWithReason(NeighborhoodStatusEnum.REJECTED, reason)}
                                    />
                                    <NeighborhoodActionDialog
                                        actionLabel="Accepter"
                                        status={NeighborhoodStatusEnum.ACCEPTED}
                                        onConfirm={() => setNeighborhoodStatusWithReason(NeighborhoodStatusEnum.ACCEPTED)}
                                    />
                                </>
                            ) : neighborhood.status == NeighborhoodStatusEnum.ACCEPTED ? (
                                <NeighborhoodActionDialog
                                    actionLabel="Bannir"
                                    status={NeighborhoodStatusEnum.REJECTED}
                                    requireReason
                                    onConfirm={(reason) => setNeighborhoodStatusWithReason(NeighborhoodStatusEnum.REJECTED, reason)}
                                />
                            ) : (
                                <NeighborhoodActionDialog
                                    actionLabel="Réouvrir"
                                    status={NeighborhoodStatusEnum.ACCEPTED}
                                    onConfirm={() => setNeighborhoodStatusWithReason(NeighborhoodStatusEnum.ACCEPTED)}
                                />
                            )
                        }
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