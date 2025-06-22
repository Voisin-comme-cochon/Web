import { Roles } from '@/domain/models/Roles.ts';
import { UserStatus } from '@/domain/models/UserStatus.ts';

export const getRoleText = (role: Roles | string) => {
    switch (role) {
        case Roles.ADMIN:
            return 'Administrateur';
        case Roles.USER:
            return 'Membre';
        case Roles.JOURNALIST:
            return 'Journaliste';
        default:
            return 'Inconnu';
    }
};

export const getStatusText = (status: UserStatus | string) => {
    switch (status) {
        case 'accepted':
            return 'Accepté';
        case 'pending':
            return 'En attente';
        case 'rejected':
            return 'Refusé';
        default:
            return 'Inconnu';
    }
};
