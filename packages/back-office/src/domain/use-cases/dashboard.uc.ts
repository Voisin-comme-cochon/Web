import {ApiError} from "@/shared/errors/ApiError.ts";
import {getTickets} from "@/infrastructure/repositories/ticket.repository.ts";

export class DashboardUseCase {
    constructor() {
    }

    public async getCreatedTicketAmountData(): Promise<number> {
        try {
            const tickets = await getTickets(null);
            return tickets.total;
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
            const tickets = await getTickets('open');
            return tickets.total;
        } catch (error) {
            if (error instanceof ApiError) {
                if ((error as ApiError).status === 400) {
                    throw new ApiError(400, 'Erreur lors de la récupération des tickets créés.', error as Error);
                }
            }
            throw new ApiError(500, 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.', error as ApiError);
        }
    }

    public async getClosedTicketAmountData(): Promise<number> {
        try {
            const tickets = await getTickets('closed');
            return tickets.total;
        } catch (error) {
            if (error instanceof ApiError) {
                if ((error as ApiError).status === 400) {
                    throw new ApiError(400, 'Erreur lors de la récupération des tickets créés.', error as Error);
                }
            }
            throw new ApiError(500, 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.', error as ApiError);
        }
    }
}