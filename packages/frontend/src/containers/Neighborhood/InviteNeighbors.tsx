import { InviteForm } from '@/components/Neighborhood/InviteForm';
import { InviteList } from '@/components/Neighborhood/InviteList';
import { useInviteList } from '@/presentation/hooks/useInviteList';
import { NeighborhoodInvitationUc } from '@/domain/use-cases/neighborhoodInvitationUc';
import { NeighborhoodFrontRepository } from '@/infrastructure/repositories/NeighborhoodFrontRepository';
import { ApiService } from '@/infrastructure/api/ApiService';
import { useState } from 'react';
import { InviteActions } from '@/components/Neighborhood/InviteActions';
import { useToast } from '@/presentation/hooks/useToast';

interface InviteNeighborsProps {
    neighborhoodId: number;
    onFinish: () => void;
}

export default function InviteNeighbors({ neighborhoodId, onFinish }: InviteNeighborsProps) {
    const { emails, input, setInput, addEmail, removeEmail, error } = useInviteList();
    const [loading, setLoading] = useState(false);
    const { showError } = useToast();
    const [, setSent] = useState(false);
    const { showInfo } = useToast();

    const handleSend = async () => {
        setLoading(true);
        try {
            const uc = new NeighborhoodInvitationUc(new NeighborhoodFrontRepository(new ApiService()));
            await uc.createMultipleInvitations({ neighborhoodId, emails });
            setSent(true);
            showInfo('Invitations envoyées avec succès !');
            onFinish();
        } catch (e) {
            if (e instanceof Error) {
                showError(e.message);
            } else {
                showError("Une erreur est survenue lors de l'envoi des invitations");
            }
            console.error('Error sending invitations:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        onFinish();
    };

    return (
        <div className="w-full max-w-lg mx-auto max-h-screen overflow-y-auto px-4 py-6">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 mb-6 border border-orange-200">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                    Qui voulez-vous <span className="text-orange-600">inviter</span> ?
                </h2>

                <p className="text-center text-gray-600 text-sm">
                    Étape 3/3 • Invitez vos proches à rejoindre votre quartier
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Ajouter des invitations</label>
                    <InviteForm input={input} setInput={setInput} addEmail={addEmail} error={error} />
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-white text-gray-500">Invitations à envoyer</span>
                    </div>
                </div>

                <InviteList emails={emails} removeEmail={removeEmail} />

                <InviteActions
                    onSend={handleSend}
                    onSkip={handleSkip}
                    disabled={emails.length === 0}
                    loading={loading}
                    emailCount={emails.length}
                />
            </div>

            <div className="text-center mt-4 text-xs text-gray-500">
                Les invités recevront un email pour rejoindre votre quartier
            </div>
        </div>
    );
}
