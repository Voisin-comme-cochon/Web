import { Sales } from '../domain/sales.model';
import { SalesAdapter } from '../adapters/sales.adapter';
import { SalesRepository } from '../domain/sales.abstract.repository';
import { CochonError } from '../../../utils/CochonError';

export class SalesService {
    constructor(private eventRepository: SalesRepository) {}

    public async getSales(page: number, limit: number): Promise<[Sales[], number]> {
        const offset = page * limit - limit;
        const [tags, count] = await this.eventRepository.getSales(limit, offset);
        const domainTags = SalesAdapter.listEntityToDomain(tags);
        return [domainTags, count];
    }

    public async getSaleById(id: number): Promise<Sales> {
        const tag = await this.eventRepository.getSalesById(id);
        if (!tag) {
            throw new CochonError('tag-not-found', 'Tag not found');
        }
        return SalesAdapter.entityToDomain(tag);
    }
}
