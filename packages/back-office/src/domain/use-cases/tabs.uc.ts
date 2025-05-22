import {ApiError} from "@/shared/errors/ApiError.ts";
import {getNeighborhoods} from "@/infrastructure/repositories/neighborhood.repository.ts";
import {NeighborhoodModel} from "@/domain/models/neighborhood.model.ts";
import {getTickets} from "@/infrastructure/repositories/ticket.repository.ts";
import {TicketModel} from "@/domain/models/ticket.model.ts";
import {getUsers} from "@/infrastructure/repositories/user.repository.ts";

export class TabUseCase {
    public

    constructor() {
    }

    public async getNeighborhoods(status: 'waiting' | 'accepted' | 'refused' | null): Promise<NeighborhoodModel[]> {
        try {
            const neighborhoods = await getNeighborhoods(status, 1, 2000);
            return neighborhoods.data;
        } catch (error) {
            if (error instanceof ApiError) {
                if ((error as ApiError).status === 400) {
                    throw new ApiError(400, 'Erreur lors de la récupération des quartiers créés.', error as Error);
                }
            }
            throw new ApiError(500, 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.', error as ApiError);
        }
    }

    public async getTickets(status: 'open' | 'resolved' | null): Promise<TicketModel[]> {
        try {
            const tickets = await getTickets(status, 1, 2000);
            return tickets.data;
        } catch (error) {
            if (error instanceof ApiError) {
                if ((error as ApiError).status === 400) {
                    throw new ApiError(400, 'Erreur lors de la récupération des tickets créés.', error as Error);
                }
            }
            throw new ApiError(500, 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.', error as ApiError);
        }
    }

    public async getUsers() {
        try {
            const users = await getUsers(1, 2000);
            return users.data;
        } catch (error) {
            if (error instanceof ApiError) {
                if ((error as ApiError).status === 400) {
                    throw new ApiError(400, 'Erreur lors de la récupération des utilisateurs créés.', error as Error);
                }
            }
            throw new ApiError(500, 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.', error as ApiError);
        }
    }
}