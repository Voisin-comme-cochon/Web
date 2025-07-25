import { useState } from 'react';
import { NeighborhoodForm } from '@/components/Neighborhood/NeighborhoodForm';
import { NeighborhoodMapForm } from '@/components/Neighborhood/NeighborhoodMapForm';
import type { NeighborhoodFormValues } from './neighborhood.schema';
import { NeighborhoodUc } from '@/domain/use-cases/neighborhoodUc';
import { NeighborhoodFrontRepository } from '@/infrastructure/repositories/NeighborhoodFrontRepository';
import AuthFooter from '@/components/AuthFooter/AuthFooter';
import { useRedirectIfAuthenticated } from '@/presentation/hooks/useRedirectIfAuthenticated.ts';
import { useAppNavigation } from '@/presentation/state/navigate';
import InviteNeighbors from '@/containers/Neighborhood/InviteNeighbors';
import { useToast } from '@/presentation/hooks/useToast.ts';
import MinimalHeader from '@/components/Header/MinimalHeader.tsx';

export function CreateNeighborhood() {
    useRedirectIfAuthenticated();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<NeighborhoodFormValues | null>(null);
    const [createdNeighborhoodId, setCreatedNeighborhoodId] = useState<number | null>(null);
    const { goMyNeighborhood, goLanding } = useAppNavigation();
    const { showError, showSuccess } = useToast();

    const handleFormSubmit = async (values: NeighborhoodFormValues) => {
        setFormData(values);
        setStep(2);
    };

    const handleMapSubmit = async (geo: { type: string; coordinates: number[][][] }) => {
        if (!formData) return;
        const neighborhoodUc = new NeighborhoodUc(new NeighborhoodFrontRepository());
        const created = await neighborhoodUc.createNeighborhood({
            ...formData,
            geo,
        });

        if (!created) {
            showError('Erreur lors de la création du quartier. Veuillez réessayer.');
            goLanding();
        }

        setCreatedNeighborhoodId(created.id);
        setStep(3);
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleInvitationFinish = () => {
        showSuccess(
            'Quartier créé et invitations envoyées avec succès !',
            'Vous serez contacté quand un administrateur validera votre demande.'
        );
        goMyNeighborhood();
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <NeighborhoodForm
                        onSubmit={handleFormSubmit}
                        onNext={() => {}}
                        initialValues={formData || undefined}
                    />
                );
            case 2:
                return <NeighborhoodMapForm onSubmit={handleMapSubmit} onBack={handleBack} />;
            case 3:
                return createdNeighborhoodId !== null ? (
                    <InviteNeighbors neighborhoodId={createdNeighborhoodId} onFinish={handleInvitationFinish} />
                ) : null;
            default:
                return null;
        }
    };

    return (
        <>
            <MinimalHeader />
            <div className="container mx-auto py-8">{renderStep()}</div>
            <AuthFooter />
        </>
    );
}
