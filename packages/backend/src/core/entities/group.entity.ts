// src/entities/group.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { TagEntity } from './tag.entity';
import { NeighborhoodEntity } from './neighborhood.entity';
import { GroupMessageEntity } from './group-message.entity';
import { GroupMembershipEntity } from './group-membership.entity';

export enum GroupTypeEntity {
    PRIVATE_CHAT = 'private_chat',
    PRIVATE_GROUP = 'private_group',
    PUBLIC = 'public',
}

@Entity('groups')
export class GroupEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    isPrivate!: boolean;

    @Column()
    description!: string;

    @Column({
        type: 'enum',
        enum: GroupTypeEntity,
        default: GroupTypeEntity.PUBLIC,
    })
    type!: GroupTypeEntity;

    @Column({ nullable: true })
    tagId?: number;

    @Column()
    neighborhoodId!: number;

    @Column({ nullable: true })
    imageUrl?: string;

    @CreateDateColumn()
    createdAt!: Date;

    // Relations
    @ManyToOne(() => TagEntity, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'tagId' })
    tag?: TagEntity;

    @ManyToOne(() => NeighborhoodEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'neighborhoodId' })
    neighborhood!: NeighborhoodEntity;

    @OneToMany(() => GroupMessageEntity, (message) => message.group)
    messages!: GroupMessageEntity[];

    @OneToMany(() => GroupMembershipEntity, (membership) => membership.group)
    memberships!: GroupMembershipEntity[];
}
