export interface UserModel {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    description: string;
    isSuperAdmin: boolean;
    newsletter: boolean;
    prefferredNotifMethod: string;
    profileImageUrl?: string | null;
}
