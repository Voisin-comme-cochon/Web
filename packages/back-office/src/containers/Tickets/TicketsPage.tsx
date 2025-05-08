import SideHeader from "@/components/SideHeader/SideHeader.tsx";

export default function TicketsPage() {
    return (
        <div className="flex min-h-screen w-full">
            <SideHeader/>
            <main className="flex flex-col flex-1 p-8">
                <p>
                    Page de gestion des utilisateurs
                </p>
            </main>
        </div>
    );
}
