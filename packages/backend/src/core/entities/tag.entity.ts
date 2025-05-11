import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EventEntity } from './event.entity';

@Entity({ name: 'tags' })
export class TagEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    color!: string;

    // Clés étrangères
    @OneToMany(() => EventEntity, (event) => event.tag)
    events?: EventEntity[];
}
