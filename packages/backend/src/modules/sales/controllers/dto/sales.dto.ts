import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber } from 'class-validator';
import { ResponseNeighborhoodDto } from '../../../neighborhoods/controllers/dto/neighborhood.dto';
import { SaleStatusEnum } from '../../../../core/entities/saleStatus.enum';
import { SalesPayementTypesEnum } from '../../../../core/entities/sales-payement-types.enum';

export class ResponseSalesDto {
    @ApiProperty({
        example: 1,
        description: 'The id of the sale',
    })
    @IsInt()
    id!: number;

    @ApiProperty({
        description: 'The neighborhood of the sale',
    })
    neighborhood!: ResponseNeighborhoodDto;

    @ApiProperty({
        example: '13',
        description: 'The price of the sale',
    })
    @IsNumber()
    price!: number;

    @ApiProperty({
        example: 1,
        description: 'The user id of the sale',
    })
    @IsInt()
    userId!: number;

    @ApiProperty({
        example: 'active',
        description: 'The status of the sale',
    })
    status!: SaleStatusEnum;

    @ApiProperty({
        example: 'Velo',
        description: 'The name of the sale',
    })
    name!: string;

    @ApiProperty({
        example: 'Velo de course',
        description: 'The description of the sale',
    })
    description!: string;

    @ApiProperty({
        example: 'cash',
        description: 'The payement type of the sale',
    })
    payementType!: SalesPayementTypesEnum;
}
