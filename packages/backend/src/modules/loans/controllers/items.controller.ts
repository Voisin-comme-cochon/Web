import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    UseInterceptors,
    Request,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiOkResponse,
    ApiNotFoundResponse,
    ApiTags,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiBadRequestResponse,
    ApiConsumes,
} from '@nestjs/swagger';
import { DecodedToken } from '../../auth/domain/auth.model';
import { IsLoginGuard } from '../../../middleware/is-login.middleware';
import { ItemAvailabilityStatus } from '../../../core/entities/item-availability.entity';
import { PaginationInterceptor } from '../../../core/pagination/pagination.interceptor';
import { Paginated, Paging } from '../../../core/pagination/pagination';
import { ItemsService } from '../services/items.service';
import {
    CreateItemDto,
    UpdateItemDto,
    CreateItemAvailabilityDto,
    UpdateItemAvailabilityDto,
    GetItemsQueryDto,
    GetItemByIdDto,
    ResponseItemDto,
    ResponseItemAvailabilityDto,
} from './dto/items.dto';

@ApiTags('items')
@Controller('items')
@ApiBearerAuth()
@UseGuards(IsLoginGuard)
export class ItemsController {
    constructor(private readonly itemsService: ItemsService) {}

    @Get()
    @UseInterceptors(PaginationInterceptor)
    @ApiOperation({ summary: 'Get items by neighborhood' })
    @ApiOkResponse({ description: 'Items found', type: [ResponseItemDto] })
    async getItemsByNeighborhood(
        @Query() query: GetItemsQueryDto,
        @Query() pagination: Paging,
        @Request() req: { user: DecodedToken }
    ): Promise<Paginated<ResponseItemDto>> {
        const userId = req.user.id;
        const [items, count] = await this.itemsService.getItemsByNeighborhood(
            query.neighborhoodId,
            userId,
            pagination.page,
            pagination.limit
        );
        return new Paginated(items as ResponseItemDto[], pagination, count);
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Get item by ID' })
    @ApiOkResponse({ description: 'Item found', type: ResponseItemDto })
    @ApiNotFoundResponse({ description: 'Item not found' })
    async getItemById(
        @Param() params: GetItemByIdDto,
        @Request() req: { user: DecodedToken }
    ): Promise<ResponseItemDto> {
        const userId = req.user.id;
        return await this.itemsService.getItemById(params.id, userId);
    }

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Create a new item' })
    @ApiCreatedResponse({ description: 'Item created', type: ResponseItemDto })
    @ApiBadRequestResponse({ description: 'Invalid input' })
    async createItem(
        @Body() createItemDto: CreateItemDto,
        @Request() req: { user: DecodedToken },
        @UploadedFile() image?: Express.Multer.File
    ): Promise<ResponseItemDto> {
        const ownerId = req.user.id;
        return await this.itemsService.createItem(createItemDto, ownerId, image);
    }

    @Put('/:id')
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Update an item' })
    @ApiOkResponse({ description: 'Item updated' })
    @ApiNotFoundResponse({ description: 'Item not found' })
    @ApiForbiddenResponse({ description: 'You can only update your own items' })
    async updateItem(
        @Param() params: GetItemByIdDto,
        @Body() updateItemDto: UpdateItemDto,
        @Request() req: { user: DecodedToken },
        @UploadedFile() image?: Express.Multer.File
    ): Promise<{ success: boolean }> {
        const ownerId = req.user.id;
        await this.itemsService.updateItem(params.id, updateItemDto, ownerId, image);
        return {
            success: true,
        };
    }

    @Delete('/:id')
    @ApiOperation({ summary: 'Delete an item' })
    @ApiOkResponse({ description: 'Item deleted' })
    @ApiNotFoundResponse({ description: 'Item not found' })
    @ApiForbiddenResponse({ description: 'You can only delete your own items' })
    async deleteItem(
        @Param() params: GetItemByIdDto,
        @Request() req: { user: DecodedToken }
    ): Promise<{
        success: boolean;
    }> {
        const ownerId = req.user.id;
        await this.itemsService.deleteItem(params.id, ownerId);
        return {
            success: true,
        };
    }

    @Get('/:id/availabilities')
    @ApiOperation({ summary: 'Get item availabilities' })
    @ApiOkResponse({ description: 'Availabilities found', type: [ResponseItemAvailabilityDto] })
    @ApiNotFoundResponse({ description: 'Item not found' })
    async getItemAvailabilities(
        @Param() params: GetItemByIdDto,
        @Request() req: { user: DecodedToken }
    ): Promise<ResponseItemAvailabilityDto[]> {
        const userId = req.user.id;
        return await this.itemsService.getItemAvailabilities(params.id, userId);
    }

    @Post('/:id/availabilities')
    @ApiOperation({ summary: 'Create item availability' })
    @ApiCreatedResponse({ description: 'Availability created', type: ResponseItemAvailabilityDto })
    @ApiNotFoundResponse({ description: 'Item not found' })
    @ApiForbiddenResponse({ description: 'You can only manage availability for your own items' })
    @ApiBadRequestResponse({ description: 'Invalid dates' })
    async createItemAvailability(
        @Param() params: GetItemByIdDto,
        @Body() createAvailabilityDto: CreateItemAvailabilityDto,
        @Request() req: { user: DecodedToken }
    ): Promise<ResponseItemAvailabilityDto> {
        const ownerId = req.user.id;
        return await this.itemsService.createItemAvailability(
            params.id,
            {
                start_date: new Date(createAvailabilityDto.start_date),
                end_date: new Date(createAvailabilityDto.end_date),
            },
            ownerId
        );
    }

    @Put('/availabilities/:id')
    @ApiOperation({ summary: 'Update item availability' })
    @ApiOkResponse({ description: 'Availability updated' })
    @ApiNotFoundResponse({ description: 'Availability not found' })
    @ApiForbiddenResponse({ description: 'You can only manage availability for your own items' })
    async updateItemAvailability(
        @Param('id') id: number,
        @Body() updateAvailabilityDto: UpdateItemAvailabilityDto,
        @Request() req: { user: DecodedToken }
    ): Promise<{ success: boolean }> {
        const ownerId = req.user.id;
        const updateData: Partial<{ start_date: Date; end_date: Date; status: ItemAvailabilityStatus }> = {};

        if (updateAvailabilityDto.start_date) {
            updateData.start_date = new Date(updateAvailabilityDto.start_date);
        }
        if (updateAvailabilityDto.end_date) {
            updateData.end_date = new Date(updateAvailabilityDto.end_date);
        }
        if (updateAvailabilityDto.status) {
            updateData.status = updateAvailabilityDto.status;
        }

        await this.itemsService.updateItemAvailability(id, updateData, ownerId);
        return {
            success: true,
        };
    }

    @Delete('/availabilities/:id')
    @ApiOperation({ summary: 'Delete item availability' })
    @ApiOkResponse({ description: 'Availability deleted' })
    @ApiNotFoundResponse({ description: 'Availability not found' })
    @ApiForbiddenResponse({ description: 'You can only manage availability for your own items' })
    async deleteItemAvailability(
        @Param('id') id: number,
        @Request() req: { user: DecodedToken }
    ): Promise<{
        success: boolean;
    }> {
        const ownerId = req.user.id;
        await this.itemsService.deleteItemAvailability(id, ownerId);
        return {
            success: true,
        };
    }
}
