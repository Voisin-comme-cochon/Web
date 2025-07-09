import { UserSummaryModel } from '../domain/models/UserSummaryModel';
import { GroupMembershipModel } from '../domain/models/GroupMembershipModel';

interface CachedUser {
    id: number;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    lastUpdated: number;
}

class UserCache {
    private cache = new Map<number, CachedUser>();
    private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes

    set(user: UserSummaryModel): void {
        this.cache.set(user.id, {
            ...user,
            lastUpdated: Date.now(),
        });
    }

    get(userId: number): CachedUser | null {
        const cached = this.cache.get(userId);
        if (!cached) return null;

        // Vérifier la fraîcheur du cache
        if (Date.now() - cached.lastUpdated > this.CACHE_TTL) {
            this.cache.delete(userId);
            return null;
        }

        return cached;
    }

    // Pré-remplir le cache avec les membres du groupe
    preloadGroupMembers(members: GroupMembershipModel[]): void {
        members.forEach((member) => this.set(member.user));
    }

    // Nettoyer le cache des entrées expirées
    cleanup(): void {
        const now = Date.now();
        for (const [userId, user] of this.cache.entries()) {
            if (now - user.lastUpdated > this.CACHE_TTL) {
                this.cache.delete(userId);
            }
        }
    }

    // Vider complètement le cache
    clear(): void {
        this.cache.clear();
    }
}

export const userCache = new UserCache();

// Nettoyer le cache toutes les 5 minutes
setInterval(
    () => {
        userCache.cleanup();
    },
    5 * 60 * 1000
);
