import { LogInSignInDtoOutput } from '../controllers/dto/auth.dto';

export class AuthAdapter {
    static tokensToDtoOutput(access_token: string, refresh_token: string): LogInSignInDtoOutput {
        return {
            access_token: access_token,
            refresh_token: refresh_token,
        };
    }
}
