import { Tag } from '../../tags/domain/tags.model';

export class User {
    id!: number;
    firstName!: string;
    lastName!: string;
    phone!: string;
    email!: string;
    address!: string;
    password!: string;
    description?: string;
    profileImageUrl?: string;
    isSuperAdmin!: boolean;
    newsletter!: boolean;
    prefferedNotifMethod!: string;
    tags: Tag[] = [];
}
