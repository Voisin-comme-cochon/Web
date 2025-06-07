import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { UserEntity } from './user.entity';
import { TagEntity } from './tag.entity';

@Entity({ name: 'user_tags' })
@Unique(['userId', 'tagId'])
export class UserTagEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'user_id' })
    userId!: number;

    @Column({ name: 'tag_id' })
    tagId!: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    assignedAt!: Date;

    @ManyToOne(() => UserEntity, (user) => user.user_tags, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: UserEntity;

    @ManyToOne(() => TagEntity, (tag) => tag.user_tags, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tag_id' })
    tag!: TagEntity;
}