import { Sales } from '../domain/sales.model';
import { ResponseSalesDto } from '../controllers/dto/sales.dto';
import { SalesEntity } from '../../../core/entities/sales.entity';
import { SalesPhotosEntity } from '../../../core/entities/sales-photos.entity';
import { SalesPhotoModel } from '../domain/sales-photo.model';
import { NeighborhoodsAdapter } from '../../neighborhoods/adapters/neighborhoods.adapter';
import { Neighborhood } from '../../neighborhoods/domain/neighborhood.model';

export class SalesAdapter {
    static entityToDomain(saleEntity: SalesEntity): Sales {
        return {
            id: saleEntity.id,
            name: saleEntity.name,
            price: saleEntity.price,
            neighborhoodId: saleEntity.neighborhoodId,
            userId: saleEntity.userId,
            status: saleEntity.status,
            description: saleEntity.description,
            payementType: saleEntity.payementType,
            photos: saleEntity.photos ? this.photosToDomain(saleEntity.photos) : [],
        };
    }

    static listEntityToDomain(salesEntities: SalesEntity[]): Sales[] {
        return salesEntities.map((saleEntity) => this.entityToDomain(saleEntity));
    }

    static photosToDomain(photosEntities: SalesPhotosEntity[]): SalesPhotoModel[] {
        return photosEntities.map((photoEntity) => this.photoToDomain(photoEntity));
    }

    static photoToDomain(saleEntity: SalesPhotosEntity): SalesPhotoModel {
        return {
            id: saleEntity.id,
            url: saleEntity.url,
            saleId: saleEntity.saleId,
            isPrimary: saleEntity.isPrimary,
        };
    }

    static domainToEntity(sale: Sales): SalesEntity {
        return {
            id: sale.id,
            name: sale.name,
            price: sale.price,
            neighborhoodId: sale.neighborhoodId,
            userId: sale.userId,
            status: sale.status,
            description: sale.description,
            payementType: sale.payementType,
        };
    }

    static domainToResponseSale(sale: Sales, neighborhood: Neighborhood): ResponseSalesDto {
        return {
            id: sale.id,
            name: sale.name,
            price: sale.price,
            neighborhood: NeighborhoodsAdapter.domainToDto(neighborhood),
            userId: sale.userId,
            status: sale.status,
            description: sale.description,
            payementType: sale.payementType,
            photos: sale.photos ?? [],
        };
    }

    static listDomainToResponseSales(sales: Sales[], neighborhoods: Neighborhood[]): ResponseSalesDto[] {
        return sales.map((sale, index) => this.domainToResponseSale(sale, neighborhoods[index]));
    }
}
