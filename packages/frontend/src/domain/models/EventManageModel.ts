import { TagModel } from '@/domain/models/tag.model.ts';

export interface EventManageModel {
    id: number;
    name: string;
    createdAt: Date;
    dateStart: Date;
    dateEnd: Date;
    registeredUsers: number;
    max: number;
    tag: TagModel;
}
