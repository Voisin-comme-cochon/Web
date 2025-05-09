import { useState } from 'react';
import { NeighborhoodForm } from '@/components/Neighborhood/NeighborhoodForm';
import type { NeighborhoodFormValues } from './neighborhood.schema';
import { NeighborhoodUc } from '@/domain/use-cases/neighborhoodUc';
import { NeighborhoodFrontRepository } from '@/infrastructure/repositories/NeighborhoodFrontRepository';
import { ApiService } from '@/infrastructure/api/ApiService';
import Header from '@/components/Header/Header';
import AuthFooter from '@/components/AuthFooter/AuthFooter';

export function CreateNeighborhood() {
    const [step, setStep] = useState(1);

    const handleFormSubmit = async (values: NeighborhoodFormValues) => {
        const neighborhoodUc = new NeighborhoodUc(new NeighborhoodFrontRepository(new ApiService()));
        await neighborhoodUc.createNeighborhood(values);
    };

    const handleNext = () => {
        setStep(2);
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <NeighborhoodForm onSubmit={handleFormSubmit} onNext={handleNext} />;
            case 2:
                return (
                    <div className="w-full flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-4">Étape 2 : Définition des contours</h2>
                            <p>Cette fonctionnalité sera bientôt disponible.</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Header />
            <div className="container mx-auto py-8">{renderStep()}</div>
            <AuthFooter />
        </>
    );
}
