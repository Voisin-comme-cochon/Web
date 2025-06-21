export class NeighborhoodUserAdapter {
    static toReadableRole(role: string): string {
        switch (role) {
            case 'admin':
                return 'Admin';
            case 'user':
                return 'Membre';
            case 'journalist':
                return 'Journaliste';
            default:
                return 'Unknown Role';
        }
    }
}
