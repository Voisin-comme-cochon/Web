import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GroupsService } from '../services/groups.service';
import { GroupsAdapter } from '../adapters/groups.adapter';
import { Paginated, Paging } from '../../../core/pagination/pagination';
import { TagsService } from '../../tags/services/tags.service';
import { IsLoginGuard } from '../../../middleware/is-login.middleware';
import { IsSuperAdminGuard } from '../../../middleware/is-super-admin.middleware';
import { GetObjectByIdDto, ResponseGroupDto } from './dto/groups.dto';

@ApiTags('groups')
@Controller('groups')
@ApiBearerAuth()
@UseGuards(IsLoginGuard)
export class GroupsController {
    constructor(
        private readonly groupsService: GroupsService,
        private readonly tagsService: TagsService
    ) {}

    @Get('/message-amount')
    @ApiOperation({ summary: 'Get the amount of messages in all groups' })
    @ApiOkResponse({ description: 'Amount of messages found' })
    @ApiNotFoundResponse({ description: 'No messages found' })
    @UseGuards(IsSuperAdminGuard)
    async countMessageAmount(): Promise<{ number: number }> {
        const number = await this.groupsService.countMessageAmount();
        return { number };
    }

    @Get()
    @ApiOperation({ summary: 'Get all groups' })
    @ApiOkResponse({ description: 'Groups found', type: ResponseGroupDto })
    @ApiNotFoundResponse({ description: 'Groups not found' })
    @UseGuards(IsSuperAdminGuard)
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
