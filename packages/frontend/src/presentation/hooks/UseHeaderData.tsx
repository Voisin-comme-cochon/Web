import { useEffect, useMemo, useState } from 'react';
import { UserModel } from '@/domain/models/user.model.ts';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { UserFrontRepository } from '@/infrastructure/repositories/UserFrontRepository.ts';
import { NeighborhoodFrontRepository } from '@/infrastructure/repositories/NeighborhoodFrontRepository.ts';
import { EventRepository } from '@/infrastructure/repositories/EventRepository.ts';
import { DecodedUser } from '@/domain/models/DecodedUser.ts';
import { jwtDecode } from 'jwt-decode';
import { TagRepository } from '@/infrastructure/repositories/TagRepository.ts';

export function useHeaderData() {
    const [user, setUser] = useState<UserModel | null>(null);
    const neighborhoodId = localStorage.getItem('neighborhoodId');
    const uc = useMemo(
        () =>
            new HomeUc(
                new UserFrontRepository(),
                new NeighborhoodFrontRepository(),
                new EventRepository(),
                new TagRepository()
            ),
        []
    );

    useEffect(() => {
        const fetchConnectedData = async () => {
            const token = localStorage.getItem('jwt');
            if (token) {
                try {
                    const decoded: DecodedUser = jwtDecode(token);
                    const fetchedUser = await uc.getUserById(decoded.id);
                    setUser(fetchedUser);
                } catch (error) {
                    console.error('Failed to fetch user :', error);
                }
            }
        };

        fetchConnectedData();
    }, []);

    return {
        user,
        neighborhoodId,
        uc,
    };
}
