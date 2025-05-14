import { Sales } from '../domain/sales.model';
import { ResponseSalesDto } from '../controllers/dto/sales.dto';
import { SalesEntity } from '../../../core/entities/sales.entity';

export class SalesAdapter {
    static entityToDomain(tagEntity: SalesEntity): Sales {
        return {
            id: tagEntity.id,
            name: tagEntity.name,
            color: tagEntity.color,
        };
    }

    static listEntityToDomain(tagEntities: SalesEntity[]): Sales[] {
        return tagEntities.map((tagEntity) => this.entityToDomain(tagEntity));
    }

    static domainToEntity(sale: Sales): SalesEntity {
        return {
            id: sale.id,
            name: sale.name,
            color: sale.color,
        };
    }

    static domainToResponseTag(sale: Sales): ResponseSalesDto {
        return {
            id: sale.id,
            name: sale.name,
            color: sale.color,
        };
    }

    static listDomainToResponseTag(sales: Sales[]): ResponseSalesDto[] {
        return sales.map((sale) => this.domainToResponseTag(sale));
    }
}
