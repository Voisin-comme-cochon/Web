import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EventEntity } from './event.entity';
import { EventRegistrationEntity } from './event-registration.entity';

@Entity({ name: 'users' })
export class UserEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column({ unique: true })
    phone!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    address!: string;

    @Column()
    password!: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true })
    profileImageUrl?: string;

    @Column({ default: false })
    isSuperAdmin!: boolean;

    @Column({ default: false })
    newsletter!: boolean;

    @Column()
    prefferedNotifMethod!: string;

    // Clé étrangères :
    @OneToMany(() => EventEntity, (event) => event.creator)
    user_events?: EventEntity[];

    @OneToMany(() => EventRegistrationEntity, (registration) => registration.user)
    user_events_registrations?: EventRegistrationEntity[];
}
