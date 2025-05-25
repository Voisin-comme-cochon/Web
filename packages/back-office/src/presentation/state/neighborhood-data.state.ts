import {useState} from "react";
import {NeighborhoodModel} from "@/domain/models/neighborhood.model.ts";

export const useNeighborhoodDataState = () => {
    const [neighborhoods, setNeighborhoods] = useState<NeighborhoodModel[]>();

    return {
        neighborhoods,
        setNeighborhoods,
    }
}