import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { UserModel } from '@/domain/models/user.model.ts';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { useAppNavigation } from '@/presentation/state/navigate.ts';
import { useToast } from '@/presentation/hooks/useToast.ts';

export default function UserMenu({ user }: { user: UserModel | null }) {
    const { goLanding } = useAppNavigation();
    const { showSuccess } = useToast();

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        localStorage.removeItem('page');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('neighborhoodId');
        showSuccess('Déconnexion réussie', 'Vous avez été déconnecté avec succès.');
        goLanding();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className={'cursor-pointer'}>
                    <AvatarImage src={user?.profileImageUrl ?? ''} />
                    <AvatarFallback>
                        {user?.firstName[0]}.{user?.lastName[0]}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuItem className={'cursor-pointer'}>Profil</DropdownMenuItem>
                <DropdownMenuItem className={'cursor-pointer'}>Paramètres</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className={'cursor-pointer text-red-500'} onClick={handleLogout}>
                    <span className="material-symbols-outlined text-s">logout</span>
                    Déconnexion
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
