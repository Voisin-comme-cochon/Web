// src/entities/group-message.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { GroupEntity } from './group.entity';

@Entity('group-messages')
export class GroupMessageEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    content!: string;

    @Column()
    userId!: number;

    @Column()
    groupId!: number;

    @CreateDateColumn()
    createdAt!: Date;

    // Relations
    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: UserEntity;

    @ManyToOne(() => GroupEntity, (group) => group.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'groupId' })
    group!: GroupEntity;
}
