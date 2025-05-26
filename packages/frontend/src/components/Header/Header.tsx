import logo from '@/assets/images/logoWebV1Light.webp';
import { Button } from '@/components/ui/button';
import { useAppNavigation } from '@/presentation/state/navigate.ts';
import { scrollToId } from '@/presentation/state/scrollToId.ts';

type HeaderProps = {
    isLanding?: boolean;
    isConnected?: boolean;
};

export default function Header({ isLanding, isConnected }: HeaderProps) {
    const { goLogin, goLanding } = useAppNavigation();

    return (
        <header className="flex items-center justify-between w-full p-4 bg-white h-[64px]">
            <div className="flex items-center">
                <img src={logo} alt="logo" className="max-w-[150px] h-auto cursor-pointer" onClick={goLanding} />

                {isLanding && (
                    <div className="flex ml-16 gap-8">
                        <button
                            onClick={() => scrollToId('why-vcc')}
                            className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                        >
                            Pourquoi nous
                        </button>
                        <button
                            onClick={() => scrollToId('discover-your-neighborhood')}
                            className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                        >
                            Voir votre quartier
                        </button>
                    </div>
                )}

                {isConnected && (
                    <div className="ml-16 text-sm text-gray-500 italic">
                        <p>Connecté</p>
                    </div>
                )}
            </div>

            {isLanding && (
                <Button variant="orange" onClick={goLogin}>
                    SE CONNECTER
                </Button>
            )}
        </header>
    );
}
