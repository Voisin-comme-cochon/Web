import SideHeader from "@/components/SideHeader/SideHeader.tsx";
import InfoHeader from "@/components/InfoHeader/InfoHeader.tsx";

export default function NeighborhoodDetailsPage() {
    return (
        <div className="flex min-h-screen w-full">
            <SideHeader/>
            <main className="flex flex-col flex-1">
                <InfoHeader title={"Quartiers"} description={"Gérez, acceptez ou refusez les quartiers"}/>

            </main>
        </div>
    );
}
