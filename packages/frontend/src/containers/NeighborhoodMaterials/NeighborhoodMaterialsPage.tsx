import DashboardHeader from '@/components/Header/DashboardHeader.tsx';
import { withHeaderData } from '@/containers/Wrapper/Wrapper.tsx';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { UserModel } from '@/domain/models/user.model.ts';

function NeighborhoodMaterialsPage({ user, uc }: { user: UserModel; uc: HomeUc }) {
    return (
        <>
            <DashboardHeader />
            <p>Mon matériel</p>
        </>
    );
}

const NeighborhoodMaterialsPageWithHeader = withHeaderData(NeighborhoodMaterialsPage);
export default NeighborhoodMaterialsPageWithHeader;
