import {LoginSignInFrontRepository} from "@/infrastructure/repositories/LoginSignInFrontRepository.ts";

export class LoginUc {
    constructor(
        private loginRepo: LoginSignInFrontRepository
    ) {
    }

    public async execute(
        email: string,
        password: string,
    ): Promise<void> {
        const tokens = await this.loginRepo.login(email, password)
        localStorage.setItem("jwt", tokens.access_token);
    }
}