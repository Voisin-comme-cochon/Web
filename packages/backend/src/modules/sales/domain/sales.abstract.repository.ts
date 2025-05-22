import { SalesEntity } from '../../../core/entities/sales.entity';

export abstract class SalesRepository {
    abstract getSales(limit: number, offset: number): Promise<[SalesEntity[], number]>;

    abstract getSalesById(id: number): Promise<SalesEntity | null>;
}
