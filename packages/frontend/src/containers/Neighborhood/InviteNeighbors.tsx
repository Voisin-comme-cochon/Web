import { InviteForm } from '@/components/Neighborhood/InviteForm';
import { InviteList } from '@/components/Neighborhood/InviteList';
import { useInviteList } from '@/presentation/hooks/useInviteList';
import { NeighborhoodInvitationUc } from '@/domain/use-cases/neighborhoodInvitationUc';
import { NeighborhoodFrontRepository } from '@/infrastructure/repositories/NeighborhoodFrontRepository';
import { ApiService } from '@/infrastructure/api/ApiService';
import { useState } from 'react';
import { InviteActions } from '@/components/Neighborhood/InviteActions.tsx';
import { useToast } from '@/presentation/hooks/useToast.ts';

interface InviteNeighborsProps {
    neighborhoodId: number;
    onFinish: () => void;
}

export default function InviteNeighbors({ neighborhoodId, onFinish }: InviteNeighborsProps) {
    const { emails, input, setInput, addEmail, removeEmail, error } = useInviteList();
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const { showInfo } = useToast();

    const handleSend = async () => {
        setLoading(true);
        setApiError(null);
        try {
            const uc = new NeighborhoodInvitationUc(new NeighborhoodFrontRepository(new ApiService()));
            await uc.createMultipleInvitations({ neighborhoodId, emails });
            setSent(true);
            showInfo('Invitations envoyées avec succès !');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            setApiError(e.message || 'Erreur lors de l’envoi des invitations');
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        onFinish();
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4 text-center">
                Qui voulez-vous <span className="text-orange">inviter</span>
                <p>{neighborhoodId}</p>
            </h2>

            <InviteForm input={input} setInput={setInput} addEmail={addEmail} error={error} />

            <hr className="w-full my-2 border-dashed border-gray-300" />

            <InviteList emails={emails} removeEmail={removeEmail} />

            {apiError && <div className="text-red-500 text-sm mb-2">{apiError}</div>}
            {sent && <div className="text-green-600 text-sm mb-2">Invitations envoyées !</div>}

            <InviteActions
                onSend={() => handleSend()}
                onSkip={() => handleSkip()}
                disabled={emails.length === 0}
                loading={loading}
            />
        </div>
    );
}
