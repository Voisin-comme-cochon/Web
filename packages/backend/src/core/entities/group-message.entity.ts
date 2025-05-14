import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GroupEntity } from './group.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'group-messages' })
export class GroupMessageEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    content!: string;

    @Column()
    userId!: string;

    @Column()
    groupId!: string;

    // Clés étrangères
    @ManyToOne(() => GroupEntity, (group) => group.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'groupId' })
    group?: GroupEntity;

    @ManyToOne(() => UserEntity, (user) => user.user_messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user?: UserEntity;
}
