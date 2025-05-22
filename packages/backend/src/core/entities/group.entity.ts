import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GroupMessageEntity } from './group-message.entity';
import { TagEntity } from './tag.entity';
import { GroupMembershipEntity } from './group-membership.entity';

@Entity({ name: 'groups' })
export class GroupEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    isPrivate!: boolean;

    @Column()
    description!: string;

    @Column()
    tagId!: number;

    // Clés étrangères
    @OneToMany(() => GroupMessageEntity, (message) => message.group, { onDelete: 'CASCADE' })
    messages?: GroupMessageEntity[];

    @OneToMany(() => GroupMembershipEntity, (member) => member.group, { onDelete: 'CASCADE' })
    members?: GroupMembershipEntity[];

    @ManyToOne(() => TagEntity, (tag) => tag.groups, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tagId' })
    tag?: TagEntity;
}
