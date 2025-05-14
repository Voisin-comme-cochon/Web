import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SaleStatusEnum } from './saleStatus.enum';
import { SalesPayementTypesEnum } from './sales-payement-types.enum';
import { SalesPhotosEntity } from './sales-photos.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'sales' })
export class SalesEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    neighborhoodId!: number;

    @Column()
    price!: number;

    @Column()
    userId!: number;

    @Column({ type: 'enum', enum: SaleStatusEnum })
    status!: SaleStatusEnum;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column({ type: 'enum', enum: SalesPayementTypesEnum })
    payementType!: SalesPayementTypesEnum;

    @ManyToOne(() => SalesPhotosEntity, (photos) => photos.sale, { onDelete: 'CASCADE' })
    photos?: SalesPhotosEntity[];

    @ManyToOne(() => UserEntity, (user) => user.sales, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    owner?: UserEntity;
}
