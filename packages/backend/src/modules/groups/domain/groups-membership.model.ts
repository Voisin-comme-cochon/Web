import { StatusMembershipGroupEnum } from '../../../core/entities/StatusMembershipGroup.enum';

export class GroupMembership {
    id!: number;
    userId!: number;
    groupId!: number;
    status!: StatusMembershipGroupEnum;
}
