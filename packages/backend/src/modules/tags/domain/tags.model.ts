export class Tag {
    id!: number;
    name!: string;
    color!: string;
    neighborhoodId!: number;
}

export type UpsertTag = Omit<Tag, 'id'>;
