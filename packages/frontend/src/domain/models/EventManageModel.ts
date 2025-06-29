import { TagModel } from '@/domain/models/tag.model.ts';

export interface EventManageModel {
    id: number;
    name: string;
    createdAt: string;
    dateStart: string;
    dateEnd: string;
    registeredUsers: number;
    max: number;
    tag: TagModel;
}
