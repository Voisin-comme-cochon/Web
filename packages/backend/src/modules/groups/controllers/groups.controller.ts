import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GroupsService } from '../services/groups.service';
import { GroupsAdapter } from '../adapters/groups.adapter';
import { Paginated, Paging } from '../../../core/pagination/pagination';
import { TagsService } from '../../tags/services/tags.service';
import { GetObjectByIdDto, ResponseGroupDto } from './dto/groups.dto';

@ApiTags('groups')
@Controller('groups')
export class GroupsController {
    constructor(
        private readonly groupsService: GroupsService,
        private readonly tagsService: TagsService
    ) {}

    @Get()
    @ApiOperation({ summary: 'Get all groups' })
    @ApiOkResponse({ description: 'Groups found', type: ResponseGroupDto })
    @ApiNotFoundResponse({ description: 'Groups not found' })
    async getGroups(@Query() pagination: Paging): Promise<Paginated<ResponseGroupDto>> {
        const [groups, count] = await this.groupsService.getGroups(pagination.page, pagination.limit);
        const tags = await Promise.all(groups.map((group) => this.tagsService.getTagById(group.tagId)));
        const responseUsers = GroupsAdapter.listDomainToResponseGroup(groups, tags);
        return new Paginated(responseUsers, pagination, count);
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Get group by id' })
    @ApiOkResponse({ description: 'group found', type: ResponseGroupDto })
    @ApiNotFoundResponse({ description: 'Group not found' })
    async getGroupById(@Param() params: GetObjectByIdDto): Promise<ResponseGroupDto> {
        const group = await this.groupsService.getGroupById(params.id);
        const tag = await this.tagsService.getTagById(group.tagId);
        return GroupsAdapter.domainToResponseGroup(group, tag);
    }
}
