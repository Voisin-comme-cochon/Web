import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('java_plugins')
export class JavaPlugin {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'varchar', length: 255 })
    version!: string;

    @Column({ type: 'varchar', length: 500 })
    description!: string;

    @Column({ type: 'varchar', length: 255 })
    fileName!: string;

    @CreateDateColumn()
    uploadedAt!: Date;
} 