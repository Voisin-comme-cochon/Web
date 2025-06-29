import DashboardHeader from '@/components/Header/DashboardHeader';
import { useHeaderData } from '@/presentation/hooks/UseHeaderData';
import { UserModel } from '@/domain/models/user.model.ts';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import GlobalChatManager from '@/components/Messaging/global-chat-manager';

export function withNeighborhoodLayout<P>(
    WrappedComponent: React.ComponentType<
        P & {
            user: UserModel;
            neighborhoodId: string;
            uc: HomeUc;
        }
    >
) {
    return function NeighborhoodLayoutWrapper(props: P) {
        const { user, neighborhoodId, uc } = useHeaderData();

        if (!user || !neighborhoodId) {
            return (
                <>
                    <DashboardHeader />
                    <div className="flex items-center justify-center h-[calc(100vh-64px)] flex-col">
                        <p className="text-lg">Veuillez sélectionner un quartier pour continuer.</p>
                    </div>
                </>
            );
        }

        return (
            <>
                <WrappedComponent {...props} user={user} neighborhoodId={neighborhoodId} uc={uc} />
                <GlobalChatManager />
            </>
        );
    };
}

export function withNeighborhoodLayoutUserCheck<P>(
    WrappedComponent: React.ComponentType<
        P & {
            uc: HomeUc;
            user: UserModel | null;
        }
    >
) {
    return function NeighborhoodLayoutWrapper(props: P) {
        const { user, uc, neighborhoodId } = useHeaderData();

        if (!user) {
            return (
                <>
                    <DashboardHeader />
                    <div className="flex items-center justify-center h-[calc(100vh-64px)] flex-col">
                        <p className="text-lg">Veuillez vous connecter pour continuer.</p>
                    </div>
                </>
            );
        }

        return (
            <>
                <WrappedComponent {...props} user={user} uc={uc} />
                {/* Only show chat if user is in a neighborhood */}
                {neighborhoodId && <GlobalChatManager />}
            </>
        );
    };
}