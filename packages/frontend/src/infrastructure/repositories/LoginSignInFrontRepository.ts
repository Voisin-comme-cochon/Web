import {ApiService} from "@/infrastructure/api/ApiService.ts";

export class LoginSignInFrontRepository {
    constructor(private apiService: ApiService) {
    }

    async login(email: string, password: string) {
        return await this.apiService.post("/auth/login", `{"email": "${email}", "password": "${password}"}`);
    }
}