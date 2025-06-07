import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import {
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiCreatedResponse,
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiConflictResponse,
} from '@nestjs/swagger';
import { TagsService } from '../services/tags.service';
import { UserTagsService } from '../services/user-tags.service';
import { TagsAdapter } from '../adapters/tags.adapter';
import { Paginated, Paging } from '../../../core/pagination/pagination';
import { PaginationInterceptor } from '../../../core/pagination/pagination.interceptor';
import { IsLoginGuard } from '../../../middleware/is-login.middleware';
import { AssignTagToUserDto, RemoveTagFromUserDto, UserTagResponseDto } from './dto/user-tag.dto';
import { GetByIdDto, TagDto, UpsertTagDto } from './dto/tags.dto';

@ApiTags('tags')
@ApiBearerAuth()
@UseGuards(IsLoginGuard)
@Controller('tags')
export class TagsController {
    constructor(
        private readonly tagsService: TagsService,
        private readonly userTagsService: UserTagsService
    ) {}

    @Get()
    @UseInterceptors(PaginationInterceptor)
    @ApiOperation({ summary: 'Get all tags' })
    @ApiOkResponse({ description: 'Tags found', type: TagDto })
    @ApiNotFoundResponse({ description: 'Tags not found' })
    async getTags(@Query() pagination: Paging): Promise<Paginated<TagDto>> {
        const [tags, count] = await this.tagsService.getTags(pagination.page, pagination.limit);
        const responseUsers = TagsAdapter.listDomainToResponseTag(tags);
        return new Paginated(responseUsers, pagination, count);
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Get tag by id' })
    @ApiOkResponse({ description: 'Tag found', type: TagDto })
    @ApiNotFoundResponse({ description: 'Tag not found' })
    async getTagById(@Param() param: GetByIdDto): Promise<TagDto> {
        const tag = await this.tagsService.getTagById(param.id);
        return TagsAdapter.domainToResponseTag(tag);
    }

    @Get('/neighborhood/:neighborhoodId')
    @ApiOperation({ summary: 'Get tags by neighborhood id' })
    @ApiOkResponse({ description: 'Tags found', type: [TagDto] })
    @ApiNotFoundResponse({ description: 'Tags not found' })
    async getTagsByNeighborhoodId(@Param('neighborhoodId') neighborhoodId: string): Promise<TagDto[]> {
        const numberId = parseInt(neighborhoodId, 10);
        const tags = await this.tagsService.getTagsByNeighborhoodId(numberId);
        return TagsAdapter.listDomainToResponseTag(tags);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new tag' })
    @ApiCreatedResponse({ description: 'Tag created successfully', type: TagDto })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    async createTag(@Body() createTagDto: UpsertTagDto): Promise<TagDto> {
        const tag = await this.tagsService.createTag(createTagDto);
        return TagsAdapter.domainToResponseTag(tag);
    }

    @Put('/:id')
    @ApiOperation({ summary: 'Update a tag' })
    @ApiOkResponse({ description: 'Tag updated successfully', type: TagDto })
    @ApiNotFoundResponse({ description: 'Tag not found' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    async updateTag(@Param() param: GetByIdDto, @Body() updateTagDto: UpsertTagDto): Promise<TagDto> {
        const tag = await this.tagsService.updateTag(param.id, updateTagDto);
        return TagsAdapter.domainToResponseTag(tag);
    }

    @Delete('/:id')
    @ApiOperation({ summary: 'Delete a tag' })
    @ApiOkResponse({ description: 'Tag deleted successfully' })
    @ApiNotFoundResponse({ description: 'Tag not found' })
    async deleteTag(@Param() param: GetByIdDto): Promise<{ success: boolean }> {
        await this.tagsService.deleteTag(param.id);
        return {
            success: true,
        };
    }

    @Post('/users/:id')
    @ApiOperation({ summary: 'Assign tags to a user' })
    @ApiCreatedResponse({ description: 'Tags assigned successfully', type: [UserTagResponseDto] })
    @ApiBadRequestResponse({ description: 'Invalid input data or user/tag not in same neighborhood' })
    @ApiConflictResponse({ description: 'User already has one of these tags' })
    @ApiNotFoundResponse({ description: 'User or tag not found' })
    async assignTagsToUser(
        @Param('id') userId: string,
        @Body() assignTagDto: AssignTagToUserDto
    ): Promise<UserTagResponseDto[]> {
        const numberId = parseInt(userId, 10);
        const userTags = await this.userTagsService.assignTagsToUser(numberId, assignTagDto.tagIdIn);
        return userTags.map((userTag) => ({
            id: userTag.id,
            userId: userTag.userId,
            tagId: userTag.tagId,
            assignedAt: userTag.assignedAt,
        }));
    }

    @Delete('/users/:id')
    @ApiOperation({ summary: 'Remove tags from a user' })
    @ApiOkResponse({ description: 'Tags removed successfully' })
    @ApiNotFoundResponse({ description: 'User or tag association not found' })
    async removeTagsFromUser(@Param('id') userId: string, @Body() removeTagDto: RemoveTagFromUserDto): Promise<void> {
        const numberId = parseInt(userId, 10);
        await this.userTagsService.removeTagsFromUser(numberId, removeTagDto.tagIdIn);
    }

    @Get('/users/:id')
    @ApiOperation({ summary: 'Get all tags assigned to a user' })
    @ApiOkResponse({ description: 'User tags found', type: [TagDto] })
    @ApiNotFoundResponse({ description: 'User not found' })
    async getUserTags(@Param('id') userId: string): Promise<TagDto[]> {
        const numberId = parseInt(userId, 10);
        const tags = await this.userTagsService.getUserTags(numberId);
        return TagsAdapter.listDomainToResponseTag(tags);
    }
}
