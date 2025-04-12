import Header from "@/components/Header/Header.tsx";
import neighborhood from "../../assets/images/landing_page_neighborhood.png";
import "./landing-page.css"
import {Button} from "@/components/ui/button.tsx";
import InfoSection from "@/components/InfoSection/InfoSection.tsx";

export default function LandingPage() {
    return (
        <div className="flex items-center justify-center flex-col w-full bg-background overflow-x-hidden">
            <Header/>
            <div className='h-[calc(100vh-64px)] w-full flex justify-center flex-col relative'>
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
                    <img src={neighborhood} className="max-w-full h-auto"/>
                </div>
                <Button
                    className={"absolute left-[50%] bottom-[64px] -translate-x-1/2 bg-[#ED5C3B] hover:bg-[#DF5839] font-bold"}>
                    CRÉER MON QUARTIER
                </Button>
            </div>
            <div className={'h-[100vh] w-full bg-white flex justify-center items-center flex-col'}>
                <div className={'w-[90vw] flex justify-center items-start flex-col mb-16'}>
                    <p className={"text-[48px]"}><span
                        className={'text-[#ED5C3B] font-bold'}>Pourquoi</span> voisin comme cochon</p>
                    <p className={"text-[24px] w-[45%]"}>Nous proposons divers services afin de fluidifier les
                        intéractions
                        entre voisins</p>
                </div>
                <div className={'w-[50vw] flex justify-around flex-row mb-12'}>
                    <InfoSection
                        icon={"calendar_month"}
                        title={"Création d'évènement"}
                        description={"activité, entraide..."}>
                    </InfoSection>
                    <InfoSection
                        icon={"breaking_news"}
                        title={"Actualités du quartier"}
                        description={"Annonces, offres d’emplois..."}>
                    </InfoSection>
                    <InfoSection
                        icon={"sell"}
                        title={"Gestion de materiel"}
                        description={"Vente, prêt, mise à disposition..."}>
                    </InfoSection>
                </div>
                <div className={'w-[50vw] flex justify-around flex-row'}>
                    <InfoSection
                        icon={"groups"}
                        title={"Groupe de discussion"}
                        description={"Messagerie, appels vidéos..."}>
                    </InfoSection>
                    <InfoSection
                        icon={"cottage"}
                        title={"Multi-quartier"}
                        description={"Rejoignez plusieurs quartiers"}>
                    </InfoSection>
                    <InfoSection
                        icon={"search"}
                        title={"Nouvelles rencontres"}
                        description={"En fonction de vos préférences"}>
                    </InfoSection>
                </div>
            </div>
        </div>
    );
}