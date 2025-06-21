import logo from '@/assets/images/logoWebV1Light.webp';
import { useAppNavigation } from '@/presentation/state/navigate.ts';

export default function MinimalHeader() {
    const { goLanding } = useAppNavigation();
    return (
        <header
            className="flex items-center justify-between w-full p-4 bg-white h-[64px] cursor-pointer"
            onClick={goLanding}
        >
            <img src={logo} alt="logo" className="max-w-[150px] h-auto" />
        </header>
    );
}
