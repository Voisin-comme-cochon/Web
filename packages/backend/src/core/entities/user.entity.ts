import { Entity } from 'typeorm';

@Entity()
export class User {
    id!: number;
    fullName!: string;
}
