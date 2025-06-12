'use client';

import CreateEventForm from '@/components/CreateEventForm/CreateEventForm.tsx';
import DashboardHeader from '@/components/Header/DashboardHeader.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { X } from 'lucide-react';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { withHeaderData } from '@/containers/Wrapper/Wrapper.tsx';

function CreateEventPage({ uc }: { uc: HomeUc }) {
    return (
        <div>
            <DashboardHeader />
            <Card className="max-w-3xl mx-auto my-8">
                <CardHeader className="flex flex-row justify-between items-center">
                    <div className={'flex gap-4 items-center'}>
                        <CardTitle className="text-2xl">Créer un évènement</CardTitle>
                    </div>
                    <Button variant="ghost" onClick={() => window.history.back()}>
                        <X />
                    </Button>
                </CardHeader>

                <CardContent className="px-6">
                    <CreateEventForm uc={uc} />
                </CardContent>
            </Card>
        </div>
    );
}

const CreateEventPageWrapper = withHeaderData(CreateEventPage);
export default CreateEventPageWrapper;
