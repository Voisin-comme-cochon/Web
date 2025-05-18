import {NeighborhoodModel} from "@/domain/models/neighborhood.model.ts";
import {ImagesModel} from "@/domain/models/images.model.ts";

export interface SaleModel {
    id: number;
    name: string;
    price: number;
    neighborhood: NeighborhoodModel;
    userId: number;
    status: string;
    description: string;
    paymentType: string;
    photos: ImagesModel[];
}