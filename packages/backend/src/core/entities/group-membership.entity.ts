import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { StatusMembershipGroupEnum } from './StatusMembershipGroup.enum';
import { UserEntity } from './user.entity';
import { GroupEntity } from './group.entity';

@Entity({ name: 'group-memberships' })
export class GroupMembershipEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userId!: string;

    @Column()
    groupId!: string;

    @Column()
    status!: StatusMembershipGroupEnum;

    // Clés étrangères
    @ManyToOne(() => UserEntity, (user) => user.user_groups, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user?: UserEntity;

    @ManyToOne(() => GroupEntity, (group) => group.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'groupId' })
    group?: GroupEntity;
}
