import React, { useEffect, useState } from 'react';
import { CompleteUserModel } from '@/domain/models/complete-user.model.ts';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import ProfilPreview from '@/components/ProfilPreview/ProfilPreview.tsx';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useAppNavigation } from '@/presentation/state/navigate.ts';

interface CarouselRecommendationProps {
    neighborhoodId: number | string;
    uc: HomeUc;
    limit?: number;
}

const CarouselRecommendation: React.FC<CarouselRecommendationProps> = ({ neighborhoodId, limit = 100, uc }) => {
    const [users, setUsers] = useState<CompleteUserModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { goUserProfile } = useAppNavigation();

    useEffect(() => {
        const fetchRecommendations = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await uc.getRecommendations(neighborhoodId, limit);
                setUsers(response);
            } catch (err: any) {
                console.error('Une erreur est survenue lors du chargement des recommendations:', err);
                setError(err.message || 'Une erreur est survenue lors du chargement des recommendations');
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [neighborhoodId, limit, uc]);

    if (loading) return <div>Chargement des recommandations...</div>;
    if (error) return <div className="text-red-600">Erreur : {error}</div>;
    if (!users.length) return <div className={'mt-4'}>Aucune recommandation disponible.</div>;

    return (
        <Carousel className="w-full mt-4 mb-4">
            <CarouselContent>
                {users.map((user) => (
                    <CarouselItem key={user.id} className="pl-2 pr-2 md:basis-1/1 lg:basis-1/4">
                        <div
                            key={user.id}
                            className="flex-shrink-0 w-full cursor-pointer"
                            onClick={() => {
                                goUserProfile(user.id);
                            }}
                        >
                            <ProfilPreview user={user} />
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    );
};

export default CarouselRecommendation;
