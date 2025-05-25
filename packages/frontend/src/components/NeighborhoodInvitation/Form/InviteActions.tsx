import { Button } from '@/components/ui/button.tsx';
import { Send, ArrowRight, Loader2 } from 'lucide-react';

interface InviteActionsProps {
    onSend: () => void;
    onSkip: () => void;
    disabled?: boolean;
    loading?: boolean;
    emailCount?: number;
}

export function InviteActions({ onSend, onSkip, disabled, loading, emailCount = 0 }: InviteActionsProps) {
    return (
        <div className="space-y-3">
            <Button
                type="button"
                className="w-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100"
                variant="orange"
                onClick={onSend}
                disabled={disabled || loading}
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Envoi en cours...</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        <span>ENVOYER {emailCount > 0 && `(${emailCount})`}</span>
                    </div>
                )}
            </Button>

            <Button
                type="button"
                className="w-full h-11 text-gray-600 hover:text-gray-800 transition-colors duration-200 group"
                variant="ghost"
                onClick={onSkip}
                disabled={loading}
            >
                <span>Passer cette étape</span>
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
        </div>
    );
}
