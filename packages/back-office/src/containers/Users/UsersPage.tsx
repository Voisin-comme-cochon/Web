import SideHeader from "@/components/SideHeader/SideHeader.tsx";
import InfoHeader from "@/components/InfoHeader/InfoHeader.tsx";

export default function UsersPage() {
    return (
        <div className="flex min-h-screen w-full">
            <SideHeader/>
            <main className="flex flex-col flex-1">
                <InfoHeader title={"Plugins / Thèmes"}
                            description={"Acceptez, refusez ou telechargez le fichier pour verifier le code"}/>
                <div className={"p-8"}>
                    <p>
                        Page de gestion des utilisateurs
                    </p>
                </div>
            </main>
        </div>
    );
}
