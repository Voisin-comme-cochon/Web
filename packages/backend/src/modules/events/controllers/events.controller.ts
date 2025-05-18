import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventsService } from '../services/events.service';
import { EventsAdapter } from '../adapters/events.adapter';
import { Paginated, Paging } from '../../../core/pagination/pagination';
import { UsersService } from '../../users/services/users.service';
import { IsLoginGuard } from '../../../middleware/is-login.middleware';
import { TagsService } from '../../tags/services/tags.service';
import { NeighborhoodService } from '../../neighborhoods/services/neighborhood.service';
import { CochonError } from '../../../utils/CochonError';
import { UserAdapter } from '../../users/adapters/user.adapter';
import { TagsAdapter } from '../../tags/adapters/tags.adapter';
import { IsSuperAdminGuard } from '../../../middleware/is-super-admin.middleware';
import { PaginationInterceptor } from '../../../core/pagination/pagination.interceptor';
import { ResponseEventDto } from './dto/events.dto';

@ApiTags('events')
@Controller('events')
@ApiBearerAuth()
@UseGuards(IsLoginGuard)
export class EventsController {
    constructor(
        private readonly eventsService: EventsService,
        private readonly usersService: UsersService,
        private readonly tagsService: TagsService,
        private readonly neighborhoodService: NeighborhoodService
    ) {}

    @Get()
    @UseInterceptors(PaginationInterceptor)
    @ApiOperation({ summary: 'Get events' })
    @ApiOkResponse({ description: 'Events found', type: ResponseEventDto })
    @ApiNotFoundResponse({ description: 'Events not found' })
    @UseGuards(IsSuperAdminGuard)
    async getEvents(@Query() pagination: Paging): Promise<Paginated<ResponseEventDto>> {
        const [events, count] = await this.eventsService.getEvents(pagination.page, pagination.limit);
        const users = await Promise.all(
            events.map(async (event) => {
                return await this.usersService.getUserById(event.createdBy);
            })
        );
        const responseUser = UserAdapter.listDomainToResponseUser(users);
        const tags = await Promise.all(
            events.map(async (event) => {
                return await this.tagsService.getTagById(event.tagId);
            })
        );
        const responseTags = TagsAdapter.listDomainToResponseTag(tags);

        const neighborhoods = await Promise.all(
            events.map(async (event) => {
                const neighborhood = await this.neighborhoodService.getNeighborhoodById(event.neighborhoodId);
                if (!neighborhood) {
                    throw new CochonError('neighborhood-not-found', 'Neighborhood not found', 404);
                }
                return neighborhood;
            })
        );
        const responseUsers = EventsAdapter.listDomainToResponseEvent(
            events,
            responseTags,
            neighborhoods,
            responseUser
        );
        return new Paginated(responseUsers, pagination, count);
    }
}
