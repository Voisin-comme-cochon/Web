import apiService from "@/infrastructure/api/ApiService.ts";

export async function getMessages(): Promise<{ data: { count: number } }> {
    return apiService.get<{ count: number }>(`messaging/messages/count`);
}