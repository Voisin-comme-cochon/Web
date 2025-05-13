import { Group } from '../domain/groups.model';
import { GroupsAdapter } from '../adapters/groups.adapter';
import { GroupsRepository } from '../domain/groups.abstract.repository';
import { CochonError } from '../../../utils/CochonError';

export class GroupsService {
    constructor(private eventRepository: GroupsRepository) {}

    public async getGroups(page: number, limit: number): Promise<[Group[], number]> {
        const offset = page * limit - limit;
        const [groups, count] = await this.eventRepository.getGroups(limit, offset);
        const domainTags = GroupsAdapter.listEntityToDomain(groups);
        return [domainTags, count];
    }

    public async getGroupById(id: number): Promise<Group> {
        const group = await this.eventRepository.getGroupById(id);
        if (!group) {
            throw new CochonError('group-not-found', 'Group not found');
        }
        return GroupsAdapter.entityToDomain(group);
    }
}
