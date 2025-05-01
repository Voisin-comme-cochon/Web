import { Button } from '@/components/ui/button';

type AuthHeaderProps = {
    onHomeClick: () => void;
    onLoginClick: () => void;
};

export default function AuthHeader({ onHomeClick, onLoginClick }: AuthHeaderProps) {
    return (
        <header className="w-full py-4 px-6 flex justify-between items-center">
            <Button 
                variant="link" 
                onClick={onHomeClick} 
                className="text-primary text-xl font-bold"
            >
                Quartier
            </Button>
            <Button 
                variant="outline" 
                className="border-orange text-orange hover:bg-orange/10" 
                onClick={onLoginClick}
            >
                Se connecter
            </Button>
        </header>
    );
}