import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Request,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { ResponseUserDto } from '../../users/controllers/dto/users.dto';
import { CreateEventDto, GetEventsByNeighborhoodIdDto, GetUserByEventIdDto, ResponseEventDto } from './dto/events.dto';

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
        const creators = await Promise.all(
            events.map(async (event) => {
                return await this.usersService.getUserById(event.createdBy);
            })
        );
        const responseCreators = UserAdapter.listDomainToResponseUser(creators);

        const eventsTags = await Promise.all(
            events.map(async (event) => {
                return await this.tagsService.getTagById(event.tagId);
            })
        );

        const responseTags = TagsAdapter.listDomainToResponseTag(eventsTags);

        const neighborhoods = await Promise.all(
            events.map(async (event) => {
                const neighborhood = await this.neighborhoodService.getNeighborhoodById(event.neighborhoodId);
                if (!neighborhood) {
                    throw new CochonError('neighborhood-not-found', 'Neighborhood not found', 404);
                }
                return neighborhood;
            })
        );

        const registeredUsers = await Promise.all(
            events.map(async (event) => {
                const [users, count] = await this.eventsService.getUsersByEventId(event.id, 1, 1);
                return count;
            })
        );

        const responseUsers = EventsAdapter.listDomainToResponseEvent(
            events,
            responseTags,
            neighborhoods,
            responseCreators,
            registeredUsers
        );
        return new Paginated(responseUsers, pagination, count);
    }

    @Get('/neighborhoods/:id')
    @ApiOperation({ summary: 'Get events by neighborhood ID' })
    @ApiOkResponse({ description: 'Events found', type: ResponseEventDto })
    @ApiNotFoundResponse({ description: 'Events not found' })
    async getEventsByNeighborhoodId(
        @Query() pagination: Paging,
        @Param() query: GetEventsByNeighborhoodIdDto
    ): Promise<Paginated<ResponseEventDto>> {
        const [events, count] = await this.eventsService.getEventsByNeighnorhoodId(
            query.id,
            pagination.page,
            pagination.limit
        );

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

        const registeredUsers = await Promise.all(
            events.map(async (event) => {
                const [users, count] = await this.eventsService.getUsersByEventId(event.id, 1, 1);
                return count;
            })
        );
        const responseUsers = EventsAdapter.listDomainToResponseEvent(
            events,
            responseTags,
            neighborhoods,
            responseUser,
            registeredUsers
        );
        return new Paginated(responseUsers, pagination, count);
    }

    @Get('/:id/users')
    @UseInterceptors(PaginationInterceptor)
    @ApiOperation({ summary: 'Get users registered for the event' })
    @ApiOkResponse({ description: 'Users found', type: UserAdapter })
    @ApiNotFoundResponse({ description: 'Event not found' })
    async getUsersByEventId(
        @Query() pagination: Paging,
        @Param() params: GetUserByEventIdDto
    ): Promise<Paginated<ResponseUserDto>> {
        const [users, count] = await this.eventsService.getUsersByEventId(params.id, pagination.page, pagination.limit);
        const responseUsers = UserAdapter.listDomainToResponseUser(users);
        return new Paginated(responseUsers, pagination, count);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new event' })
    @ApiOkResponse({ description: 'Event created successfully', type: ResponseEventDto })
    @UseInterceptors(FileInterceptor('event-image'))
    @ApiConsumes('multipart/form-data')
    async createEvent(
        @Body() body: CreateEventDto,
        @UploadedFile() file: Express.Multer.File,
        @Request()
        req: {
            user: { id: string };
        }
    ): Promise<ResponseEventDto> {
        const createdEvent = await this.eventsService.createEvent({
            name: body.name,
            description: body.description,
            neighborhoodId: body.neighborhoodId,
            tagId: body.tagId,
            addressStart: body.addressStart ?? null,
            addressEnd: body.addressEnd ?? null,
            createdBy: parseInt(req.user.id, 10),
            photo: file,
            dateStart: body.dateStart,
            dateEnd: body.dateEnd,
            min: body.min,
            max: body.max,
        });

        const creator = await this.usersService.getUserById(createdEvent.createdBy);
        const responseCreator = UserAdapter.domainToResponseUser(creator);

        const tag = await this.tagsService.getTagById(createdEvent.tagId);
        const responseTag = TagsAdapter.domainToResponseTag(tag);

        const neighborhood = await this.neighborhoodService.getNeighborhoodById(createdEvent.neighborhoodId);

        if (!neighborhood) {
            throw new CochonError('neighborhood-not-found', 'Neighborhood not found', 404);
        }

        const [users, countUsers] = await this.eventsService.getUsersByEventId(createdEvent.id, 1, 1);

        return EventsAdapter.domainToResponseEvent(
            createdEvent,
            responseTag,
            neighborhood,
            responseCreator,
            countUsers
        );
    }
}
