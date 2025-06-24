import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { GroupEntity } from './group.entity';

export enum MembershipStatusEntity {
    PENDING = 'pending',
    ACTIVE = 'active',
}

@Entity('group-memberships')
export class GroupMembershipEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userId!: number;

    @Column()
    groupId!: number;

    @Column({
        type: 'enum',
        enum: MembershipStatusEntity,
        default: MembershipStatusEntity.PENDING,
    })
    status!: MembershipStatusEntity;

    @Column({
        type: 'boolean',
        default: false,
    })
    isOwner!: boolean;

    // Relations
    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: UserEntity;

    @ManyToOne(() => GroupEntity, (group) => group.memberships, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'groupId' })
    group!: GroupEntity;
}
