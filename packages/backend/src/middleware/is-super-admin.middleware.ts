import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { DecodedToken } from '../modules/auth/domain/auth.model';

@Injectable()
export class IsSuperAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<{
            headers: { authorization?: string };
            user: DecodedToken;
        }>();

        return request.user.isSuperAdmin;
    }
}
