import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {IsInt, IsISO8601, IsString} from "class-validator";

@Entity({ name: 'user_tokens' })
export class UserTokenEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @IsInt()
    userId!: number;

    @Column({ unique: true })
    @IsString()
    token!: string;

    @Column()
    @IsISO8601()
    expirationDate!: Date;
}
