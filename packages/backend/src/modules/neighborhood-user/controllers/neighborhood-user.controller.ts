import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NeighborhoodUserService } from '../services/neighborhood-user.service';

@ApiTags('neighborhoods-user')
@Controller('neighborhoods-user')
export class NeighborhoodUserController {
    constructor(private readonly neighborhoodUserService: NeighborhoodUserService) {}
}
