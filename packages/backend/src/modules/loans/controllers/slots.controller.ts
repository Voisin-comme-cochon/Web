import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, ParseIntPipe, Request } from '@nestjs/common';
import { DecodedToken } from '../../auth/domain/auth.model';
import { IsLoginGuard } from '../../../middleware/is-login.middleware';
import { ItemAvailabilitySlotsService } from '../services/item-availability-slots.service';
import {
    ItemAvailabilitySlot,
    CreateItemAvailabilitySlotRequest,
    ItemAvailabilitySlotFilters,
} from '../domain/item-availability-slot.model';

@Controller('slots')
@UseGuards(IsLoginGuard)
export class SlotsController {
    constructor(private readonly slotsService: ItemAvailabilitySlotsService) {}

    @Get(':id')
    async getSlotById(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: { user: DecodedToken }
    ): Promise<ItemAvailabilitySlot | null> {
        return this.slotsService.getSlotById(id, req.user.id);
    }

    @Get('availability/:availabilityId')
    async getSlotsByAvailabilityId(
        @Param('availabilityId', ParseIntPipe) availabilityId: number,
        @Request() req: { user: DecodedToken }
    ): Promise<ItemAvailabilitySlot[]> {
        return this.slotsService.getSlotsByAvailabilityId(availabilityId, req.user.id);
    }

    @Get('loan-request/:loanRequestId')
    async getSlotsByLoanRequestId(
        @Param('loanRequestId', ParseIntPipe) loanRequestId: number
    ): Promise<ItemAvailabilitySlot[]> {
        return this.slotsService.getSlotsByLoanRequestId(loanRequestId);
    }

    @Get()
    async getSlotsWithFilters(
        @Query() filters: ItemAvailabilitySlotFilters,
        @Request() req: { user: DecodedToken }
    ): Promise<ItemAvailabilitySlot[]> {
        return this.slotsService.getSlotsWithFilters(filters, req.user.id);
    }

    @Post()
    async createSlot(
        @Body() createSlotRequest: CreateItemAvailabilitySlotRequest,
        @Request() req: { user: DecodedToken }
    ): Promise<ItemAvailabilitySlot> {
        return this.slotsService.createSlot(createSlotRequest, req.user.id);
    }

    @Delete(':id')
    async deleteSlot(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: { user: DecodedToken }
    ): Promise<{ success: boolean }> {
        const success = await this.slotsService.deleteSlot(id, req.user.id);
        return { success };
    }

    @Post(':id/cancel')
    async cancelSlot(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: { user: DecodedToken }
    ): Promise<{ success: boolean }> {
        const success = await this.slotsService.cancelSlot(id, req.user.id);
        return { success };
    }

    @Get('availability/:availabilityId/conflicts')
    async checkSlotConflicts(
        @Param('availabilityId', ParseIntPipe) availabilityId: number,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('excludeSlotId') excludeSlotId: number,
        @Request() req: { user: DecodedToken }
    ): Promise<ItemAvailabilitySlot[]> {
        return this.slotsService.checkSlotConflicts(
            availabilityId,
            new Date(startDate),
            new Date(endDate),
            excludeSlotId,
            req.user.id
        );
    }

    @Get('availability/:availabilityId/available')
    async getAvailableSlots(
        @Param('availabilityId', ParseIntPipe) availabilityId: number,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Request() req: { user: DecodedToken }
    ): Promise<ItemAvailabilitySlot[]> {
        return this.slotsService.getAvailableSlots(
            availabilityId,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
            req.user.id
        );
    }
}
