import SideHeader from "@/components/SideHeader/SideHeader.tsx";
import InfoHeader from "@/components/InfoHeader/InfoHeader.tsx";
import CustomGrid from "@/components/CustomGrid/CustomGrid.tsx";
import React, {useMemo} from "react";

export default function NeighborhoodPage() {
    const {
        neighborhoodsData,
        setNeighborhoodsData,
    } = useNeighborhoodDataState();
    }
    const neighborhoodColumns = useMemo(() => [
        {name: 'Date', className: 'font-bold text-center text-black', formatter: commonDateFormatter},
        {name: 'Nom du quartier', className: 'font-bold text-center text-black'},
        {name: 'Statut', className: 'font-bold text-center text-black', formatter: statusFormatter('waiting')},
        {
            name: 'Actions',
            className: 'font-bold text-center text-black',
            attributes: {style: 'width: 128px; min-width: 128px;'},
            formatter: actionFormatter
        },
    ], []);

    return (
        <div className="flex min-h-screen w-full">
            <SideHeader/>
            <main className="flex flex-col flex-1">
                <InfoHeader title={"Quartiers"} description={"Gérez, acceptez ou refusez les quartiers"}/>
                <div className={"p-8"}>
                    <CustomGrid data={neighborhoodsData} columns={neighborhoodColumns} options={options}/>
                </div>
            </main>
        </div>
    );
}
