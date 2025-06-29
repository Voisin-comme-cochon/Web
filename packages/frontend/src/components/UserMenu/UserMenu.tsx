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
import AvatarComponent from '@/components/AvatarComponent/AvatarComponent.tsx';

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
            <DropdownMenuTrigger>
                <div className="cursor-pointer">
                    <AvatarComponent image={(user as UserModel)?.profileImageUrl || undefined} />
                </div>
            </DropdownMenuTrigger>{' '}
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
