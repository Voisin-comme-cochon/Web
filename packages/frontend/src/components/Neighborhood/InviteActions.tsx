import { Button } from '@/components/ui/button';

interface InviteActionsProps {
    onSend: () => void;
    onSkip: () => void;
    disabled?: boolean;
    loading?: boolean;
}

export function InviteActions({ onSend, onSkip, disabled, loading }: InviteActionsProps) {
    return (
        <div className="flex flex-col gap-2 mt-6">
            <Button type="button" className="w-full" variant="orange" onClick={onSend} disabled={disabled || loading}>
                {loading ? 'Envoi en cours...' : 'ENVOYER'}
            </Button>
            <Button type="button" className="w-full" variant="outline" onClick={onSkip} disabled={loading}>
                Passer cette étape
            </Button>
        </div>
    );
}
