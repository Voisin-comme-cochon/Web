import {UserModel} from "@/domain/models/user.model.ts";
import {NeighborhoodModel} from "@/domain/models/neighborhood.model.ts";
import {TagModel} from "@/domain/models/tag.model.ts";
import {GeometryModel} from "@/domain/models/geometry.model.ts";

export interface EventModel {
    id: number;
    creator: UserModel;
    neighborhood: NeighborhoodModel;
    name: string;
    description: string;
    createdAt: Date;
    dateStart: Date;
    dateEnd: Date;
    tag: TagModel;
    min: number;
    max: number;
    photo: string;
    addressStart: GeometryModel | null;
    addressEnd: GeometryModel | null;
}