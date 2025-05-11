import { useState } from 'react';
import { NeighborhoodForm } from '@/components/Neighborhood/NeighborhoodForm';
import { NeighborhoodMapForm } from '@/components/Neighborhood/NeighborhoodMapForm';
import type { NeighborhoodFormValues } from './neighborhood.schema';
import { NeighborhoodUc } from '@/domain/use-cases/neighborhoodUc';
import { NeighborhoodFrontRepository } from '@/infrastructure/repositories/NeighborhoodFrontRepository';
import { ApiService } from '@/infrastructure/api/ApiService';
import Header from '@/components/Header/Header';
import AuthFooter from '@/components/AuthFooter/AuthFooter';

export function CreateNeighborhood() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<NeighborhoodFormValues | null>(null);

    const handleFormSubmit = async (values: NeighborhoodFormValues) => {
        setFormData(values);
        setStep(2);
    };

    const handleMapSubmit = async (geo: { type: string; coordinates: number[][][] }) => {
        if (!formData) return;

        const neighborhoodUc = new NeighborhoodUc(new NeighborhoodFrontRepository(new ApiService()));
        await neighborhoodUc.createNeighborhood({
            ...formData,
            geo,
        });
    };

    const handleBack = () => {
        setStep(1);
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
