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
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Copy } from 'lucide-react';
import { Input } from '@/components/ui/input.tsx';
import { useState } from 'react';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';

export default function UserMenu({ user, uc }: { user: UserModel | null; uc: HomeUc }) {
    const { goLanding, goUserProfile } = useAppNavigation();
    const [duration, setDuration] = useState<number>(7);
    const [maxUses, setMaxUses] = useState<number>(1);
    const [inviteLink, setInviteLink] = useState<string>('');
    const { showSuccess } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const neighborhoodId = Number(localStorage.getItem('neighborhoodId'));

    const generateLink = async () => {
        const link = await uc.generateInviteLink(neighborhoodId, duration, maxUses);
        setInviteLink(link);
        showSuccess('Lien généré avec succès !');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteLink).then(() => {
            showSuccess('Lien copié dans le presse-papier !');
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        localStorage.removeItem('page');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('neighborhoodId');
        showSuccess('Déconnexion réussie', 'Vous avez été déconnecté avec succès.');
        goLanding();
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer">
                        <AvatarImage src={user?.profileImageUrl ?? ''} />
                        <AvatarFallback>
                            {user?.firstName[0]}.{user?.lastName[0]}
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56">
                    <DropdownMenuItem className="cursor-pointer" onClick={() => goUserProfile(user.id)}>
                        Profil
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">Paramètres</DropdownMenuItem>

                    <DropdownMenuItem
                        className="cursor-pointer"
                        onSelect={(e) => {
                            e.preventDefault();
                            setIsDialogOpen(true);
                        }}
                    >
                        Inviter des membres
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem className="cursor-pointer text-red-500" onClick={handleLogout}>
                        <span className="material-symbols-outlined text-s">logout</span>
                        Déconnexion
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Inviter des membres</DialogTitle>
                        <DialogDescription>
                            Renseignez la durée de validité du lien (en jours) et le nombre maximum d'utilisations.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Durée (jours)</label>
                            <Input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                min={1}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Nombre max d'utilisations</label>
                            <Input
                                type="number"
                                value={maxUses}
                                onChange={(e) => setMaxUses(Number(e.target.value))}
                                min={1}
                            />
                        </div>

                        {inviteLink && (
                            <div className="mt-2 flex items-center space-x-2 bg-gray-100 p-3 rounded-lg">
                                <Input value={inviteLink} readOnly className="flex-1 bg-white" />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyToClipboard}
                                    className="flex items-center space-x-1"
                                >
                                    <Copy className="h-4 w-4" />
                                    <span>Copier</span>
                                </Button>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button onClick={generateLink} variant="orange">
                            Générer le lien
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
