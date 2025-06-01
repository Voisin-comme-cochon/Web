import logo from '@/assets/images/logoWebV1Light.webp';
import { Button } from '@/components/ui/button';
import { useAppNavigation } from '@/presentation/state/navigate';
import { scrollToId } from '@/presentation/state/scrollToId';

export default function LandingHeader() {
    const { goLogin, goLanding } = useAppNavigation();

    return (
        <header className="flex items-center justify-between w-full p-4 bg-white h-[64px]">
            <img src={logo} alt="logo" className="max-w-[150px] h-auto cursor-pointer" onClick={goLanding} />
            <div className="flex gap-8 w-full ml-16">
                <button onClick={() => scrollToId('why-vcc')} className="hover:underline">
                    Pourquoi nous
                </button>
                <button onClick={() => scrollToId('discover-your-neighborhood')} className="hover:underline">
                    Voir votre quartier
                </button>
            </div>
            <Button variant="orange" onClick={goLogin}>
                SE CONNECTER
            </Button>
        </header>
    );
}
