import logo from "@/assets/images/logoWebV1Light.webp";
import IconText from "../IconText/IconText";

const links = [
    {to: "/dashboard", icon: "dashboard", text: "Accueil"},
    {to: "/neighborhoods", icon: "cottage", text: "Quartiers"},
    {to: "/users", icon: "manage_accounts", text: "Users"},
    {to: "/tickets", icon: "confirmation_number", text: "Tickets"},
    {to: "/plugins-themes", icon: "videogame_asset", text: "Plugins / Thèmes"},
];

export default function SideHeader() {
    return (
        <aside
            className="w-1/12 bg-white border-r border-gray-200 flex flex-col items-center h-screen sticky top-0 py-6 shadow-lg">
            <div className="p-2">
                <img src={logo} alt="logo"/>
            </div>
            <nav className="flex flex-1 flex-col justify-center gap-6">
                {links.map(link => (
                    <IconText key={link.to} {...link} />
                ))}
            </nav>
        </aside>
    );
}
