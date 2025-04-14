import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NeighborhoodService } from '../services/neighborhood.service';

@ApiTags('neighborhood')
@Controller('neighborhood')
export class NeighborhoodController {
    constructor(private readonly neighborhoodService: NeighborhoodService) {}
}
