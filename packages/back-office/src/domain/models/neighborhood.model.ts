import {NeighborhoodStatusEnum} from "@/domain/models/neighborhood-status.enum.ts";
import {ImagesModel} from "@/domain/models/images.model.ts";
import {GeometryModel} from "@/domain/models/geometry.model.ts";

export interface NeighborhoodModel {
    id: number;
    name: string;
    geo: GeometryModel
    status: NeighborhoodStatusEnum;
    description: string;
    creationDate: Date;
    images: ImagesModel[];
}