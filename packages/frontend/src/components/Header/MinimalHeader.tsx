import logo from '@/assets/images/logoWebV1Light.webp';

export default function MinimalHeader() {
    return (
        <header className="flex items-center justify-between w-full p-4 bg-white h-[64px]">
            <img src={logo} alt="logo" className="max-w-[150px] h-auto" />
        </header>
    );
}
