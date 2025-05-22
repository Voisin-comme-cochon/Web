import { SaleStatusEnum } from '../../../core/entities/saleStatus.enum';
import { SalesPayementTypesEnum } from '../../../core/entities/sales-payement-types.enum';
import { SalesPhotoModel } from './sales-photo.model';

export class Sales {
    id!: number;
    neighborhoodId!: number;
    price!: number;
    userId!: number;
    status!: SaleStatusEnum;
    name!: string;
    description!: string;
    payementType!: SalesPayementTypesEnum;
    photos?: SalesPhotoModel[];
}
