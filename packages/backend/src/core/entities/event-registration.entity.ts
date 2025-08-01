import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EventEntity } from './event.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'event_registrations' })
export class EventRegistrationEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userId!: number;

    @Column()
    eventId!: number;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user?: UserEntity;

    @ManyToOne(() => EventEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'eventId' })
    event?: EventEntity;
}
