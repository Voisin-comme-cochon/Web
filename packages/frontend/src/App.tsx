import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Toaster } from '@/components/ui/sonner.tsx';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card.tsx';

export default function App() {

    const onClickEvent = () => {
        toast('Tu as cliqué chacal !');
    }

    return (
        <div className={'flex items-center justify-center flex-col h-screen w-screen bg-background'}>
            <Card className={'flex flex-col items-center justify-center p-4 gap-4'}>
                <h1 className={'text-3xl font-bold'}>Formulaire</h1>
                <Input className={'w-fit'} placeholder={'Enter your name'} />
                <Button variant={'default'} onClick={() => onClickEvent()}>Click me</Button>
                <Toaster position={'top-center'} duration={2000} />
            </Card>
        </div>
    );
}
