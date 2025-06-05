import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood.ts';
import { UserModel } from '@/domain/models/user.model.ts';
import { TagModel } from 'back-office/src/domain/models/tag.model.ts';
import { GeometryModel } from '@/domain/models/geometry.model.ts';

export interface EventModel {
    id: number;
    creator: UserModel;
    neighborhood: FrontNeighborhood;
    name: string;
    description: string;
    createdAt: Date;
    dateStart: Date;
    dateEnd: Date;
    tag: TagModel;
    min: number;
    max: number;
    photo: string;
    addressStart: GeometryModel | null;
    addressEnd: GeometryModel | null;
    registeredUsers: number;
}

export interface EventModelWithUser {
    id: number;
    creator: UserModel;
    neighborhood: FrontNeighborhood;
    name: string;
    description: string;
    createdAt: Date;
    dateStart: Date;
    dateEnd: Date;
    tag: TagModel;
    min: number;
    max: number;
    photo: string;
    addressStart: GeometryModel | null;
    addressEnd: GeometryModel | null;
    registeredUsers: UserModel[];
}
