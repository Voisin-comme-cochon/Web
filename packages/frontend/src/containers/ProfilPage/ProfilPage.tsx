import DashboardHeader from '@/components/Header/DashboardHeader.tsx';
import { withHeaderData } from '@/containers/Wrapper/Wrapper.tsx';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { UserModel } from '@/domain/models/user.model.ts';
import { useParams } from 'react-router-dom';

function ProfilPage({ uc, neighborhoodId, user }: { uc: HomeUc; neighborhoodId: number; user: UserModel }) {
    const { userId } = useParams<{ userId: string }>();

    return (
        <>
            <DashboardHeader />
            <div className={'h-[calc(100vh-64px)] flex items-center justify-center relative'}>
                <p>profil numero {userId}</p>
            </div>
        </>
    );
}

export default withHeaderData(ProfilPage);
