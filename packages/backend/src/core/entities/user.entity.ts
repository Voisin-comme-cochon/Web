import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EventEntity } from './event.entity';
import { EventRegistrationEntity } from './event-registration.entity';
import { GroupMessageEntity } from './group-message.entity';
import { GroupMembershipEntity } from './group-membership.entity';
import { SalesEntity } from './sales.entity';
import { NeighborhoodUserEntity } from './neighborhood-user.entity';
import { NeighborhoodInvitationEntity } from './neighborhood-invitation.entity';
import { UserTagEntity } from './user-tag.entity';

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
    @OneToMany(() => EventEntity, (event) => event.creator, { onDelete: 'CASCADE' })
    user_events?: EventEntity[];

    @OneToMany(() => EventRegistrationEntity, (registration) => registration.user, { onDelete: 'CASCADE' })
    user_events_registrations?: EventRegistrationEntity[];

    @OneToMany(() => GroupMessageEntity, (messages) => messages.user, { onDelete: 'CASCADE' })
    user_messages?: GroupMessageEntity[];

    @OneToMany(() => GroupMembershipEntity, (group) => group.user, { onDelete: 'CASCADE' })
    user_groups?: GroupMembershipEntity[];

    @OneToMany(() => SalesEntity, (sales) => sales.owner, { onDelete: 'CASCADE' })
    sales?: SalesEntity[];

    @OneToMany(() => NeighborhoodUserEntity, (user) => user.user)
    neighborhood_users?: NeighborhoodUserEntity[];

    @OneToMany(() => NeighborhoodInvitationEntity, (invitation) => invitation.creator)
    created_invitations?: NeighborhoodInvitationEntity[];

    @OneToMany(() => UserTagEntity, (userTag) => userTag.user)
    tags?: UserTagEntity[];
}
