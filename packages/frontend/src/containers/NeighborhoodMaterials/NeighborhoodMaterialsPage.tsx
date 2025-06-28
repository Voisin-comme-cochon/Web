import DashboardHeader from '@/components/Header/DashboardHeader.tsx';
import { withNeighborhoodLayout } from '@/containers/Wrapper/NeighborhoodWrapper';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { UserModel } from '@/domain/models/user.model.ts';

function NeighborhoodMaterialsPage({ user, neighborhoodId, uc }: { user: UserModel; neighborhoodId: string; uc: HomeUc }) {
    return (
        <>
            <DashboardHeader />
            <p>Mon matériel</p>
        </>
    );
}

export default withNeighborhoodLayout(NeighborhoodMaterialsPage);
