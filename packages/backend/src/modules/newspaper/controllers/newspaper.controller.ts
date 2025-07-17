import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { NewspaperService } from '../services/newspaper.service';
import { IsLoginGuard } from '../../../middleware/is-login.middleware';

@UseGuards(IsLoginGuard)
@Controller('newspaper')
export class NewspaperController {
  constructor(private readonly newspaperService: NewspaperService) {}

  @Post()
  async create(@Body() body: { userId: string, neighborhoodId: string, content: any }) {
    return this.newspaperService.create(body.userId, body.neighborhoodId, body.content);
  }

  @Get()
  async findAll() {
    return this.newspaperService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.newspaperService.findOne(id);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.newspaperService.findByUser(userId);
  }

  @Get('neighborhood/:neighborhoodId')
  async findByNeighborhood(@Param('neighborhoodId') neighborhoodId: string) {
    return this.newspaperService.findByNeighborhood(neighborhoodId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { content: any }) {
    return this.newspaperService.update(id, body.content);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.newspaperService.delete(id);
  }
} 