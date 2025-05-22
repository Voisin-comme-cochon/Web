import SideHeader from "@/components/SideHeader/SideHeader.tsx";
import InfoHeader from "@/components/InfoHeader/InfoHeader.tsx";
import {useUserDataState} from "@/presentation/state/user-data.state.ts";
import {useFetchUserData} from "@/presentation/hooks/fetch-user-data.ts";
import {h} from "gridjs";
import {useMemo} from "react";
import CustomGrid from "@/components/CustomGrid/CustomGrid.tsx";

export default function UsersPage() {
    const {
        users,
        setUsers
    } = useUserDataState();

    useFetchUserData(setUsers)

    const actionFormatter = (cell: string | number) =>
        h('div', {className: 'flex justify-center'},
            h('button', {
                    className: 'flex items-center gap-1 px-2 py-2 rounded border border-blue text-blue bg-white hover:bg-blue-50 transition-colors',
                    style: {cursor: 'pointer'},
                    title: 'Voir',
                    onClick: () => alert(`Détails de l'élément ${cell}`),
                },
                h('span', {className: 'material-icons', style: {fontSize: '18px'}}, 'edit')
            )
        );

    const userData = useMemo(
        () => (users ?? []).map(u => [
            u.firstName,
            u.lastName,
            u.email,
            u.description,
            u.id
        ]),
        [users]
    );

    const userColumns = useMemo(
        () => [
            {name: 'Prénom', className: 'font-bold text-center text-black'},
            {name: 'Nom', className: 'font-bold text-center text-black'},
            {name: 'Email', className: 'font-bold text-center text-black'},
            {name: 'Description', className: 'font-bold text-center text-black'},
            {
                name: 'Actions',
                className: 'font-bold text-center text-black',
                attributes: {style: 'width: 128px; min-width: 128px;'},
                formatter: actionFormatter
            },
        ],
        []
    );

    const options = useMemo(
        () => ({
            search: true,
            pagination: {enabled: true, limit: 5},
            className: {thead: 'custom-header'},
        }),
        []
    );

    return (
        <div className="flex min-h-screen w-full">
            <SideHeader/>
            <main className="flex flex-col flex-1">
                <InfoHeader title={"Plugins / Thèmes"}
                            description={"Acceptez, refusez ou telechargez le fichier pour verifier le code"}/>
                <div className={"p-8"}>
                    <CustomGrid data={userData} columns={userColumns} options={options}/>
                </div>
            </main>
        </div>
    );
}
