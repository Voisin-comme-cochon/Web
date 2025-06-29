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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Link as LinkIcon, Mail as MailIcon } from 'lucide-react';
import { Input } from '@/components/ui/input.tsx';
import { useState } from 'react';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import AvatarComponent from '@/components/AvatarComponent/AvatarComponent.tsx';

export default function UserMenu({ user, uc }: { user: UserModel | null; uc: HomeUc }) {
    const { goLanding, goUserProfile, goCreateNeighborhood } = useAppNavigation();
    const [duration, setDuration] = useState<number>(7);
    const [maxUses, setMaxUses] = useState<number>(1);
    const [inviteLink, setInviteLink] = useState<string>('');
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const neighborhoodId = Number(localStorage.getItem('neighborhoodId'));
    const [type, setType] = useState<'link' | 'email'>('link');
    const [emailInput, setEmailInput] = useState<string>('');
    const [emailDuration, setEmailDuration] = useState<number>(7);
    const { showSuccess, showError } = useToast();

    const sendByEmail = async () => {
        const emails = emailInput
            .split(/[\s,;]+/)
            .map((e) => e.trim())
            .filter((e) => e);
        if (!emails.length) {
            showError('Ajoutez au moins un email.');
            return;
        }
        try {
            await uc.sendInviteEmails(neighborhoodId.toString(), emails, emailDuration);
            showSuccess('Emails envoyés !');
            setEmailInput('');
        } catch {
            showError('Échec de l’envoi.');
        }
    };
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
                <DropdownMenuTrigger>
                <div className="cursor-pointer">
                    <AvatarComponent image={(user as UserModel)?.profileImageUrl || undefined} />
                </div>
            </DropdownMenuTrigger>{' '}

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

                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => {
                            goCreateNeighborhood();
                        }}
                    >
                        Créer un quartier
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem className="cursor-pointer text-red-500" onClick={handleLogout}>
                        <span className="material-symbols-outlined text-s">logout</span>
                        Déconnexion
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Inviter des membres</DialogTitle>
                        <DialogDescription>Sélectionnez un mode d&apos;invitation</DialogDescription>
                    </DialogHeader>

                    <RadioGroup value={type} onValueChange={setType} className="flex space-x-4 my-4">
                        <div className="flex items-center space-x-1">
                            <RadioGroupItem value="link" id="opt-link" />
                            <LinkIcon className="h-4 w-4" />
                            <label htmlFor="opt-link" className="text-sm">
                                Lien
                            </label>
                        </div>
                        <div className="flex items-center space-x-1">
                            <RadioGroupItem value="email" id="opt-email" />
                            <MailIcon className="h-4 w-4" />
                            <label htmlFor="opt-email" className="text-sm">
                                Email
                            </label>
                        </div>
                    </RadioGroup>

                    {type === 'link' ? (
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm">Durée (jours)</label>
                                <Input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(+e.target.value)}
                                    min={1}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm">Max utilisations</label>
                                <Input
                                    type="number"
                                    value={maxUses}
                                    onChange={(e) => setMaxUses(+e.target.value)}
                                    min={1}
                                    className="mt-1"
                                />
                            </div>
                            {inviteLink && (
                                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                                    <Input readOnly value={inviteLink} className="flex-1 text-xs" />
                                    <Button size="sm" variant="orange" onClick={copyToClipboard}>
                                        Copier
                                    </Button>
                                </div>
                            )}
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm">
                                    Fermer
                                </Button>
                                <Button size="sm" variant="orange" onClick={generateLink}>
                                    Générer
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div>
                                <Textarea
                                    rows={3}
                                    placeholder="Emails séparés par virgules ou espaces"
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm">Durée validité (jours)</label>
                                <Input
                                    type="number"
                                    value={emailDuration}
                                    onChange={(e) => setEmailDuration(+e.target.value)}
                                    min={1}
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm">
                                    Fermer
                                </Button>
                                <Button size="sm" variant={'orange'} onClick={sendByEmail}>
                                    Envoyer
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
