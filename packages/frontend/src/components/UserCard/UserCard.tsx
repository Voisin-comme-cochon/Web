import { UserModel } from '@/domain/models/user.model.ts';
import './style.css';
import { useEffect, useState } from 'react';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';

export default function UserCard({ user, isCreator, uc }: { user: UserModel; isCreator: boolean; uc: HomeUc }) {
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    useEffect(() => {
        const checkProfileImage = async () => {
            if (user) {
                try {
                    const resUser = await uc.getUserById(user.id);
                    setProfileImageUrl(resUser.profileImageUrl ?? null);
                } catch (error) {
                    console.error('Error fetching profile image:', error);
                }
            }
        };

        checkProfileImage();
    }, []);

    if (!user) {
        return <div className="user-card">Chargement</div>;
    }

    return (
        <div className="user-card">
            {isCreator && (
                <span className="material-symbols-outlined creator-crown" title="Créateur">
                    crown
                </span>
            )}
            <div className="user-photo-container">
                {profileImageUrl ? (
                    <img src={profileImageUrl} alt={`${user.firstName} ${user.lastName}`} className="user-photo" />
                ) : (
                    <span className={'material-symbols-outlined'}>person</span>
                )}
            </div>
            <p className="user-name">{`${user.firstName} ${user.lastName}`}</p>
        </div>
    );
}
