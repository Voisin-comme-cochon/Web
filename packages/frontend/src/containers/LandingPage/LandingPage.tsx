import Header from "@/components/Header/Header.tsx";
import neighborhood from "../../assets/images/landing_page_neighborhood.png";
import "./landing-page.css"
import {Button} from "@/components/ui/button.tsx";

export default function LandingPage() {
    return (
        <div className={'flex items-center justify-center flex-col w-screen bg-background'}>
            <Header/>
            <div className='h-[calc(100vh-64px)] w-full flex items-center justify-center flex-col relative'>
                <div className="w-full flex items-center justify-center flex-row">
                    <div className={'w-[50%]'}>
                        <p className={'text-[48px]'}>Découvrez ce qu’est vraiment une vie de <span
                            className={'text-[#ED5C3B] font-bold'}>quartier</span>
                        </p>
                        <p className={"text-[24px]"}>
                            Voisin comme cochon permet de
                            <span className={"important-word"}>simplifier</span> l’entraide et
                            l’échange entre les membres d’un quartier</p>
                    </div>
                    <img src={neighborhood}/>
                </div>
                <Button
                    className={"absolute left-[50%] bottom-[64px] -translate-x-1/2 bg-[#ED5C3B] hover:bg-[#DF5839] font-bold"}>
                    CRÉER MON QUARTIER
                </Button>
            </div>
        </div>
    );
}