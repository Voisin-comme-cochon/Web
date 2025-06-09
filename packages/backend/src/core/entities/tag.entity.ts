import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EventEntity } from './event.entity';
import { GroupEntity } from './group.entity';
import { UserTagEntity } from './user-tag.entity';

@Entity({ name: 'tags' })
export class TagEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    color!: string;

    // Relations
    @OneToMany(() => EventEntity, (event) => event.tag, { onDelete: 'CASCADE' })
    events?: EventEntity[];

    @OneToMany(() => GroupEntity, (group) => group.tag, { onDelete: 'CASCADE' })
    groups?: GroupEntity[];

    @OneToMany(() => UserTagEntity, (userTag) => userTag.tag)
    users?: UserTagEntity[];
}
