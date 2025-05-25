import {ApiError} from "@/shared/errors/ApiError.ts";
import {getNeighborhoodById, getUsersByNeighborhood} from "@/infrastructure/repositories/neighborhood.repository.ts";
import {NeighborhoodModel} from "@/domain/models/neighborhood.model.ts";
import {UserModel} from "@/domain/models/user.model.ts";

export class NeighborhoodDetailsUseCase {
    constructor() {
    }

    public async getNeighborhoodById(id: string | number): Promise<NeighborhoodModel> {
        try {
            return await getNeighborhoodById(id);
        } catch (error) {
            if (error instanceof ApiError) {
                if ((error as ApiError).status === 400) {
                    throw new ApiError(400, 'Erreur lors de la récupération des quartiers créés.', error as Error);
                }
            }
            throw new ApiError(500, 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.', error as ApiError);
        }
    }

    public async getUsersByNeighborhood(id: string | number): Promise<UserModel[]> {
        try {
            const paginatedUsers = await getUsersByNeighborhood(id, 1, 2000);
            return paginatedUsers.data;
        } catch (error) {
            if (error instanceof ApiError) {
                if ((error as ApiError).status === 400) {
                    throw new ApiError(400, 'Erreur lors de la récupération des utilisateurs du quartier.', error as Error);
                }
            }
            throw new ApiError(500, 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.', error as ApiError);
        }
    }
}