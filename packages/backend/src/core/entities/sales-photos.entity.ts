import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SalesEntity } from './sales.entity';

@Entity({ name: 'sales_photos' })
export class SalesPhotosEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    saleId!: number;

    @Column()
    url!: string;

    @Column()
    isPrimary!: boolean;

    @ManyToOne(() => SalesEntity, (sales) => sales, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'saleId' })
    sale?: SalesEntity;
}
