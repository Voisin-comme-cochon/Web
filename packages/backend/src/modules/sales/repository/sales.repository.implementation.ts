import { DataSource } from 'typeorm';
import { SalesRepository } from '../domain/sales.abstract.repository';
import { SalesEntity } from '../../../core/entities/sales.entity';

export class SalesRepositoryImplementation implements SalesRepository {
    constructor(private readonly dataSource: DataSource) {}

    public getSales(limit: number, offset: number): Promise<[SalesEntity[], number]> {
        return this.dataSource.getRepository(SalesEntity).findAndCount({
            skip: offset,
            take: limit,
        });
    }

    public getSalesById(id: number): Promise<SalesEntity | null> {
        return this.dataSource.getRepository(SalesEntity).findOne({
            where: { id: id },
            relations: {
                photos: true,
            },
        });
    }
}
