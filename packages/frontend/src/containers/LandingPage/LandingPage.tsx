import Header from '@/components/Header/Header.tsx';
import neighborhood from '../../assets/images/landing_page_neighborhood.webp';
import './landing-page.css';
import { Button } from '@/components/ui/button.tsx';
import InfoSection from '@/components/InfoSection/InfoSection.tsx';
import MapBox from '@/components/MapBox/MapBox.tsx';
import { useAppNavigation } from '@/presentation/state/navigate';

export default function LandingPage() {
    const { goCreateNeighborhood } = useAppNavigation();

    return (
        <div className="flex items-center justify-center flex-col w-full bg-background overflow-x-hidden">
            <Header isLanding />
            <div className="h-[calc(100vh-64px)] w-full flex justify-center flex-col relative">
                <div className="w-full flex items-center justify-center flex-row">
                    <div className={'w-1/2'}>
                        <p className={'text-5xl mb-2'}>
                            Découvrez ce qu'est vraiment une vie de{' '}
                            <span className="font-bold text-orange">quartier</span>
                        </p>
                        <p className={'text-2xl'}>
                            Voisin comme cochon permet de
                            <span className={'important-word'}>simplifier</span> l'entraide et l'échange entre les
                            membres d'un quartier
                        </p>
                    </div>
                    <img src={neighborhood} className="max-w-full h-auto" alt={"Illustration d'un quartier"} />
                </div>
                <Button onClick={() => goCreateNeighborhood} variant={'floatingOrange'}>
                    CRÉER MON QUARTIER
                </Button>
            </div>
            <div className={'h-lvh w-full bg-white flex justify-center items-center flex-col'} id={'why-vcc'}>
                <div className={'w-full flex ml-16 justify-center items-start flex-col mb-8'}>
                    <p className={'text-5xl mb-2'}>
                        <span className={'text-orange font-bold'}>Pourquoi</span> voisin comme cochon
                    </p>
                    <p className={'text-2xl w-1/2'}>
                        Nous proposons divers services afin de fluidifier les intéractions entre voisins
                    </p>
                </div>
                <div className={'w-full flex justify-around flex-row mb-4'}>
                    <div className="items-center flex flex-row gap-8">
                        <InfoSection
                            icon={'calendar_month'}
                            title={"Création d'évènement"}
                            description={'activité, entraide...'}
                        ></InfoSection>
                        <InfoSection
                            icon={'breaking_news'}
                            title={'Actualités du quartier'}
                            description={"Annonces, offres d'emplois..."}
                        ></InfoSection>
                        <InfoSection
                            icon={'sell'}
                            title={'Gestion de materiel'}
                            description={'Vente, prêt, mise à disposition...'}
                        ></InfoSection>
                    </div>
                </div>
                <div className={'w-full flex justify-around flex-row mb-4'}>
                    <div className="items-center flex flex-row gap-8">
                        <InfoSection
                            icon={'groups'}
                            title={'Groupe de discussion'}
                            description={'Messagerie, appels vidéos...'}
                        />
                        <InfoSection
                            icon={'cottage'}
                            title={'Multi-quartier'}
                            description={'Rejoignez plusieurs quartiers'}
                        />
                        <InfoSection
                            icon={'search'}
                            title={'Nouvelles rencontres'}
                            description={'En fonction de vos préférences'}
                        />
                    </div>
                </div>
            </div>
            <div
                className={'h-lvh w-full bg-foreground flex justify-center items-center flex-col'}
                id={'discover-your-neighborhood'}
            >
                <div className={'w-full ml-16 flex justify-center items-start flex-col mb-8'}>
                    <p className={'text-5xl text-white mb-2'}>
                        <span className={'text-orange font-bold'}>Découvrez</span> votre quartier
                    </p>
                    <p className={'text-2xl text-white w-1/2'}>Avec toutes les personnes qui s'y trouvent</p>
                </div>

                <MapBox canCreate={false} showDetails={true} />
            </div>
        </div>
    );
}
