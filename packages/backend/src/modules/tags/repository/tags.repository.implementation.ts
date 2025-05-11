import { DataSource } from 'typeorm';
import { TagsRepository } from '../domain/tags.abstract.repository';
import { TagEntity } from '../../../core/entities/tag.entity';

export class TagsRepositoryImplementation implements TagsRepository {
    constructor(private readonly dataSource: DataSource) {}

    public getTags(limit: number, offset: number): Promise<[TagEntity[], number]> {
        return this.dataSource.getRepository(TagEntity).findAndCount({
            skip: offset,
            take: limit,
        });
    }

    public getTagById(id: number): Promise<TagEntity | null> {
        return this.dataSource.getRepository(TagEntity).findOne({
            where: { id: id },
        });
    }
}
