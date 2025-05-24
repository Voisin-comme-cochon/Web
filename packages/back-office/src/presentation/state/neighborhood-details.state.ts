import {useState} from "react";
import {NeighborhoodModel} from "@/domain/models/neighborhood.model.ts";

export const useNeighborhoodDetailsState = () => {
    const [neighborhood, setNeighborhood] = useState<NeighborhoodModel | null>();

    return {
        neighborhood,
        setNeighborhood,
    }
}