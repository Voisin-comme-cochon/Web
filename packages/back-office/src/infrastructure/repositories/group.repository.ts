import apiService from "@/infrastructure/api/ApiService.ts";

export async function getMessages(): Promise<{ data: number }> {
    const response = await apiService.get(`groups/message-amount`);
    return await response.data;
}