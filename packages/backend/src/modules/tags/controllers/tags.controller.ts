import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Put,
    Query,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiCreatedResponse,
    ApiBadRequestResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { TagsService } from '../services/tags.service';
import { TagsAdapter } from '../adapters/tags.adapter';
import { Paginated, Paging } from '../../../core/pagination/pagination';
import { PaginationInterceptor } from '../../../core/pagination/pagination.interceptor';
import { IsLoginGuard } from '../../../middleware/is-login.middleware';
import { IsSuperAdminGuard } from '../../../middleware/is-super-admin.middleware';
import { AssignTagDto, GetByIdDto, TagDto, UpsertTagDto } from './dto/tags.dto';

@ApiTags('tags')
@ApiBearerAuth()
@UseGuards(IsLoginGuard)
@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) {}

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

    @Post()
    @UseGuards(IsSuperAdminGuard)
    @ApiOperation({ summary: 'Create a new tag' })
    @ApiCreatedResponse({ description: 'Tag created successfully', type: TagDto })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    async createTag(@Body() createTagDto: UpsertTagDto): Promise<TagDto> {
        const tag = await this.tagsService.createTag(createTagDto);
        return TagsAdapter.domainToResponseTag(tag);
    }

    @Put('/:id')
    @UseGuards(IsSuperAdminGuard)
    @ApiOperation({ summary: 'Update a tag' })
    @ApiOkResponse({ description: 'Tag updated successfully', type: TagDto })
    @ApiNotFoundResponse({ description: 'Tag not found' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    async updateTag(@Param() param: GetByIdDto, @Body() updateTagDto: UpsertTagDto): Promise<TagDto> {
        const tag = await this.tagsService.updateTag(param.id, updateTagDto);
        return TagsAdapter.domainToResponseTag(tag);
    }

    @Delete('/:id')
    @UseGuards(IsSuperAdminGuard)
    @ApiOperation({ summary: 'Delete a tag' })
    @ApiOkResponse({ description: 'Tag deleted successfully' })
    @ApiNotFoundResponse({ description: 'Tag not found' })
    async deleteTag(@Param() param: GetByIdDto): Promise<{ success: boolean }> {
        await this.tagsService.deleteTag(param.id);
        return {
            success: true,
        };
    }

    @Patch('/users/:id')
    @UseGuards(IsLoginGuard)
    @ApiOperation({ summary: 'Update user tags' })
    @ApiOkResponse({ description: 'User tags updated successfully' })
    @ApiNotFoundResponse({ description: 'User not found' })
    async updateUserTags(
        @Param() param: GetByIdDto,
        @Body() updateTagDto: AssignTagDto
    ): Promise<{
        success: boolean;
    }> {
        await this.tagsService.updateUserTags(param.id, updateTagDto.tagIds);
        return {
            success: true,
        };
    }
}
