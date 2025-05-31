export class NeighborhoodUserAdapter {
    static toReadableRole(role: string): string {
        switch (role) {
            case 'admin':
                return 'Admin';
            case 'user':
                return 'Membre';
            default:
                return 'Unknown Role';
        }
    }
}
