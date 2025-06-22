import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Copy, Link as LinkIcon } from 'lucide-react';
import { Input } from '@/components/ui/input.tsx';
import { useState } from 'react';
import { useToast } from '@/presentation/hooks/useToast.ts';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';

export function InvitationDialog({
    isDialogOpen,
    setIsDialogOpen,
    uc,
    neighborhoodId,
}: {
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
    uc: HomeUc;
    neighborhoodId: number;
}) {
    const [duration, setDuration] = useState<number>(7);
    const [maxUses, setMaxUses] = useState<number>(1);
    const [inviteLink, setInviteLink] = useState<string>('');
    const { showSuccess } = useToast();

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

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="orange" size="sm" className="flex items-center">
                    <LinkIcon className="mr-2 h-4 w-4" /> Inviter des membres
                </Button>
            </DialogTrigger>
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
    );
}
