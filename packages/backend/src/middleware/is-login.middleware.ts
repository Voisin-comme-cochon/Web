import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../modules/auth/services/auth.service';
import { DecodedToken } from '../modules/auth/domain/auth.model';
import { UserTokenEntity } from '../core/entities/user-tokens.entity';
import { CochonError } from '../utils/CochonError';

@Injectable()
export class IsLoginGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService,
        private readonly jwtService: JwtService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<{
            headers: { authorization?: string };
            user?: DecodedToken;
        }>();
        const token: string = request.headers.authorization?.split(' ')[1] ?? '';

        if (!token) {
            return false;
        }

        try {
            const decodedToken: DecodedToken = this.jwtService.verify(token);
            request.user = decodedToken; // a prendre ensuite dans req.user Request() req
            const refresh_tokens: UserTokenEntity[] = await this.authService.getTokensById(decodedToken.id);
            if (refresh_tokens.some((refresh_token) => refresh_token.token === token)) {
                throw new CochonError('invalid-token', 'Token is invalid', 401);
            }
            return true;
        } catch {
            return false;
        }
    }
}
