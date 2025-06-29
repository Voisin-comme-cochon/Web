import { GroupMessage } from './group-message.model';

export abstract class GroupMessageRepository {
    abstract findById(id: number): Promise<GroupMessage | null>;

    abstract findByGroupId(groupId: number, page: number, limit: number): Promise<[GroupMessage[], number]>;

    abstract create(message: Omit<GroupMessage, 'id' | 'createdAt' | 'user'>): Promise<GroupMessage>;

    abstract getLastMessageByGroupId(groupId: number): Promise<GroupMessage | null>;

    abstract countByGroupId(groupId: number): Promise<number>;

    abstract delete(id: number): Promise<void>;

    abstract getAmountOfMessage(): Promise<number>;
}
