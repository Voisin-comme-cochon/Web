import logo from '@/assets/images/logoWebV1Light.png';
import {Button} from "@/components/ui/button.tsx";

export default function Header() {
    return (
        <header className="flex items-center justify-between w-full p-4 bg-white h-[64px]">
            <div className="flex items-center">
                <img
                    src={logo}
                    alt="logo"
                    className="max-w-[150px] h-auto"
                />
                <div className="flex ml-16">
                    <h1 onClick={(_) => {
                        document.querySelector("#why-vcc")?.scrollIntoView({behavior: "smooth"})
                    }} className="hover:underline cursor-pointer">Pourquoi nous</h1>
                    <h1 className="ml-8 hover:underline cursor-pointer">Voir votre quartier</h1>
                </div>
            </div>
            <Button className="bg-[#ED5C3B] text-white hover:bg-[#DF5839] font-bold">
                SE CONNECTER
            </Button>
        </header>
    );
}
