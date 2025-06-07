import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EventEntity } from './event.entity';
import { GroupEntity } from './group.entity';
import { NeighborhoodEntity } from './neighborhood.entity';
import { UserTagEntity } from './user-tag.entity';

@Entity({ name: 'tags' })
export class TagEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    color!: string;

    @Column({ name: 'neighborhood_id' })
    neighborhoodId!: number;

    // Relations
    @ManyToOne(() => NeighborhoodEntity, (neighborhood) => neighborhood.tags, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'neighborhood_id' })
    neighborhood!: NeighborhoodEntity;
    @OneToMany(() => EventEntity, (event) => event.tag, { onDelete: 'CASCADE' })
    events?: EventEntity[];

    @OneToMany(() => GroupEntity, (group) => group.tag, { onDelete: 'CASCADE' })
    groups?: GroupEntity[];

    @OneToMany(() => UserTagEntity, (userTag) => userTag.tag, { onDelete: 'CASCADE' })
    user_tags?: UserTagEntity[];
}
