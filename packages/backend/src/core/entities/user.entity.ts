import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

    @Column()
    description!: string;

    @Column({ default: false })
    isSuperAdmin!: boolean;

    @Column({ default: false })
    newsletter!: boolean;

    @Column()
    prefferedNotifMethod!: string;
}
