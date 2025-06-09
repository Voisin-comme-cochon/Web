import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { TagEntity } from './tag.entity';

@Entity({ name: 'user_tags' })
export class UserTagEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userId!: number;

    @Column()
    tagId!: number;

    @ManyToOne(() => UserEntity, (user) => user.tags, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user?: UserEntity;

    @ManyToOne(() => TagEntity, (tag) => tag.users, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tagId' })
    tag?: TagEntity;
}
