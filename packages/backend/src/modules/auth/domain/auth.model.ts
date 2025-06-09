export class DecodedToken {
    id!: number;
    isSuperAdmin!: boolean;
}

export class AuthModel {
    id!: number;
    firstName!: string;
    lastName!: string;
    phone!: string;
    email!: string;
    address!: string;
    password!: string;
    tagIds!: string;
    description?: string;
    profileImage?: Express.Multer.File | null;
}

export type CreateAuthModel = Omit<AuthModel, 'id'>;
