import DashboardHeader from '@/components/Header/DashboardHeader';
import { useHeaderData } from '@/presentation/hooks/UseHeaderData';
import { UserModel } from '@/domain/models/user.model.ts';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';

export function withHeaderData<P>(
    WrappedComponent: React.ComponentType<
        P & {
            user: UserModel;
            neighborhoodId: string;
            uc: HomeUc;
        }
    >
) {
    return function WithHeaderDataWrapper(props: P) {
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

        return <WrappedComponent {...props} user={user} neighborhoodId={neighborhoodId} uc={uc} />;
    };
}

export function withHeaderDataOnlyUserCheck<P>(
    WrappedComponent: React.ComponentType<
        P & {
            uc: HomeUc;
            user: UserModel | null;
        }
    >
) {
    return function WithHeaderDataWrapper(props: P) {
        const { user, uc } = useHeaderData();

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

        return <WrappedComponent {...props} user={user} uc={uc} />;
    };
}
