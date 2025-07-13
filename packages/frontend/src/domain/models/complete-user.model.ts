import { TagModel } from '@/domain/models/tag.model.ts';

export interface CompleteUserModel {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    description: string;
    isSuperAdmin: boolean;
    latitude: string;
    longitude: string;
    newsletter: boolean;
    prefferredNotifMethod: string;
    profileImageUrl: string | null;
    tags: TagModel[];
}
