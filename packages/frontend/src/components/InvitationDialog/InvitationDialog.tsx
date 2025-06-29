import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Link as LinkIcon, Mail as MailIcon } from 'lucide-react';
import { Input } from '@/components/ui/input.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.tsx';
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
    const [type, setType] = useState<'link' | 'email'>('link');

    const [duration, setDuration] = useState<number>(7);
    const [maxUses, setMaxUses] = useState<number>(1);
    const [inviteLink, setInviteLink] = useState<string>('');

    const [emailInput, setEmailInput] = useState<string>('');
    const [emailDuration, setEmailDuration] = useState<number>(7);

    const { showSuccess, showError } = useToast();

    const generateLink = async () => {
        try {
            const link = await uc.generateInviteLink(neighborhoodId, duration, maxUses);
            setInviteLink(link);
            showSuccess('Lien généré !');
        } catch {
            showError('Impossible de générer le lien.');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteLink).then(() => {
            showSuccess('Copié !');
        });
    };

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

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="orange" size="sm" className="flex items-center">
                    <LinkIcon className="mr-2 h-4 w-4" /> Inviter des membres
                </Button>
            </DialogTrigger>
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
    );
}
