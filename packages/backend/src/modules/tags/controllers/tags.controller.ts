import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TagsService } from '../services/tags.service';
import { TagsAdapter } from '../adapters/tags.adapter';
import { Paginated, Paging } from '../../../core/pagination/pagination';
import { ResponseTagDto } from './dto/tags.dto';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) {}

    @Get()
    @ApiOperation({ summary: 'Get all tags' })
    @ApiOkResponse({ description: 'Tags found', type: ResponseTagDto })
    @ApiNotFoundResponse({ description: 'Tags not found' })
    async getTags(@Query() pagination: Paging): Promise<Paginated<ResponseTagDto>> {
        const [tags, count] = await this.tagsService.getTags(pagination.page, pagination.limit);
        const responseUsers = TagsAdapter.listDomainToResponseTag(tags);
        return new Paginated(responseUsers, pagination, count);
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Get tag by id' })
    @ApiOkResponse({ description: 'Tag found', type: ResponseTagDto })
    @ApiNotFoundResponse({ description: 'Tag not found' })
    async getTagById(@Param('id') id: string): Promise<ResponseTagDto> {
        const numberId = parseInt(id, 10);
        console.log(id);
        const tag = await this.tagsService.getTagById(numberId);
        return TagsAdapter.domainToResponseTag(tag);
    }
}
