import {useState} from "react";
import {NeighborhoodModel} from "@/domain/models/neighborhood.model.ts";
import {UserModel} from "@/domain/models/user.model.ts";

export const useNeighborhoodDetailsState = () => {
    const [neighborhood, setNeighborhood] = useState<NeighborhoodModel | null>();
    const [members, setMembers] = useState<UserModel[] | null>();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return {
        neighborhood,
        setNeighborhood,
        selectedImage,
        setSelectedImage,
        members,
        setMembers
    }
}