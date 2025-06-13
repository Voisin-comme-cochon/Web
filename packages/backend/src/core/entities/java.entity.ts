import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'JavaVersion' })
export class JavaVersion {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    version!: string;

    @Column()
    fileName!: string;

    @CreateDateColumn()
    uploadedAt!: Date;
}
