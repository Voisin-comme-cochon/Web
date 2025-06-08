export class Tag {
    id!: number;
    name!: string;
    color!: string;
}

export type UpsertTag = Omit<Tag, 'id'>;
