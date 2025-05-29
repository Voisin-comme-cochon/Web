import logo from '@/assets/images/logoWebV1Light.webp';
import { Button } from '@/components/ui/button';
import { useAppNavigation } from '@/presentation/state/navigate';
import { scrollToId } from '@/presentation/state/scrollToId';
import AvatarComponent from '@/components/AvatarComponent/AvatarComponent';
import ComboboxComponent from '@/components/ComboboxComponent/ComboboxComponent';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood.ts';
import { UserModel } from '@/domain/models/user.model.ts';

type HeaderProps = {
    isLanding?: boolean;
    isConnected?: boolean;
    setPage?: (page: number) => void;
    page?: number;
    setNeighborhoodId?: (id: number) => void;
    user?: UserModel | null;
    neighborhoods?: FrontNeighborhood[] | null;
};

export default function Header({
    isLanding = false,
    isConnected = false,
    setPage,
    page,
    setNeighborhoodId,
    user,
    neighborhoods,
}: HeaderProps) {
    const { goLogin, goLanding } = useAppNavigation();

    return (
        <header className="flex items-center justify-between w-full p-4 bg-white h-[64px] ">
            {(isLanding || isConnected) && (
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
                </div>
            )}

            {isConnected && setPage && page !== undefined && (
                <div className="flex flex-1 justify-center gap-8">
                    {[
                        { id: 1, icon: 'apartment', label: 'Mon quartier' },
                        { id: 2, icon: 'calendar_today', label: 'Événements' },
                        { id: 3, icon: 'newsmode', label: 'Journal' },
                        { id: 4, icon: 'emoji_objects', label: 'Matériel' },
                    ].map(({ id, icon, label }) => (
                        <div
                            key={id}
                            className="flex flex-col items-center gap-1 cursor-pointer"
                            onClick={() => setPage(id)}
                        >
                            <span
                                className={`material-symbols-outlined ${page === id ? 'text-black' : 'text-gray-400'}`}
                            >
                                {icon}
                            </span>
                            <p className={`text-xs ${page === id ? 'text-black' : 'text-gray-400'}`}>{label}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-4">
                {isConnected && user && (
                    <>
                        <ComboboxComponent neighborhoods={neighborhoods ?? []} setNeighborhoodId={setNeighborhoodId} />
                        <AvatarComponent user={user} />
                    </>
                )}
                {isLanding && (
                    <Button variant="orange" onClick={goLogin}>
                        SE CONNECTER
                    </Button>
                )}
            </div>
        </header>
    );
}
