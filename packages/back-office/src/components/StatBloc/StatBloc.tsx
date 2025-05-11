import {Card, CardContent} from "@/components/ui/card";

type StatBlocProps = {
    iconId: string;
    title: string;
    value: number | string;
    color?: string;
};

export default function StatBloc({iconId, title, value, color = "#000000"}: StatBlocProps) {
    return (
        <div className="w-full max-w-[256px] mx-auto mt-4">
            <Card className="p-4">
                <CardContent className="p-0">
                    <div className="flex justify-between items-start">
                        <p className="text-2xl font-bold " style={{color: color}}>{value}</p>
                        <span className="material-symbols-outlined text-3xl text-primary">
              {iconId}
            </span>
                    </div>
                    <p className="mt-4 text-muted-foreground text-m text-left"
                       style={{color: color}}>{title}</p>
                </CardContent>
            </Card>
        </div>
    );
}
