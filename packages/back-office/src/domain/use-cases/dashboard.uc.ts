import {ApiError} from "@/shared/errors/ApiError.ts";
import {getTickets} from "@/infrastructure/repositories/ticket.repository.ts";
import {getNeighborhoods} from "@/infrastructure/repositories/neighborhood.repository.ts";
import {getUsers} from "@/infrastructure/repositories/user.repository.ts";

export class DashboardUseCase {
    constructor() {
    }

    public async getCreatedTicketAmountData(): Promise<number> {
        try {
            const tickets = await getTickets(null, 1, 1);
            return tickets.metadata.totalCount;
        } catch (error) {
            if (error instanceof ApiError) {
                if ((error as ApiError).status === 400) {
                    throw new ApiError(400, 'Erreur lors de la récupération des tickets créés.', error as Error);
                }
            }
            throw new ApiError(500, 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.', error as ApiError);
        }
    }

    public async getOpenTicketAmountData(): Promise<number> {
        try {
            const tickets = await getTickets('open', 1, 1);
            return tickets.metadata.totalCount;
        } catch (error) {
            if (error instanceof ApiError) {
                if ((error as ApiError).status === 400) {
                    throw new ApiError(400, 'Erreur lors de la récupération des tickets créés.', error as Error);
                }
            }
            throw new ApiError(500, 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.', error as ApiError);
        }
    }

    public async getResolvedTicketAmountData(): Promise<number> {
        try {
            const tickets = await getTickets('resolved', 1, 1);
            return tickets.metadata.totalCount;
        } catch (error) {
            if (error instanceof ApiError) {
                if ((error as ApiError).status === 400) {
                    throw new ApiError(400, 'Erreur lors de la récupération des tickets créés.', error as Error);
                }
            }
            throw new ApiError(500, 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.', error as ApiError);
        }
    }

    public async getCreatedNeighborhoodAmountData(): Promise<number> {
        try {
            const neighborhoods = await getNeighborhoods(null, 1, 1);
            return neighborhoods.metadata.totalCount;
        } catch (error) {
            if (error instanceof ApiError) {
                if ((error as ApiError).status === 400) {
                    throw new ApiError(400, 'Erreur lors de la récupération des quartiers créés.', error as Error);
                }
            }
            throw new ApiError(500, 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.', error as ApiError);
        }
    }

    public async getUsersAmountData(): Promise<number> {
        try {
            const users = await getUsers(1, 1);
            return users.metadata.totalCount;
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