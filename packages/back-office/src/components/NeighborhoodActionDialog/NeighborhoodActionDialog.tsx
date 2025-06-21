import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog.tsx"
import {Textarea} from "@/components/ui/textarea.tsx"
import {Button} from "@/components/ui/button.tsx"
import {useState} from "react"
import {NeighborhoodStatusEnum} from "@/domain/models/neighborhood-status.enum.ts";

export default function NeighborhoodActionDialog({
                                                     actionLabel,
                                                     status,
                                                     requireReason,
                                                     onConfirm,
                                                 }: {
    actionLabel: string
    status: NeighborhoodStatusEnum
    requireReason?: boolean
    onConfirm: (reason?: string) => void
}) {
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState("")

    const handleConfirm = () => {
        if (requireReason && reason.trim() === "") return
        onConfirm(reason)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className={
                        status === NeighborhoodStatusEnum.ACCEPTED
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "bg-red-500 hover:bg-red-600 text-white"
                    }
                >
                    {actionLabel}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Êtes-vous sûr de vouloir {actionLabel.toLowerCase()} ce quartier&nbsp;?</DialogTitle>
                </DialogHeader>
                {requireReason && (
                    <div className="mt-4">
                        <label className="block mb-2 text-sm font-medium">Veuillez indiquer une raison :</label>
                        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} required={requireReason}/>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                    <Button onClick={handleConfirm} variant={"orange"}
                            disabled={requireReason && reason.trim() === ""}>Confirmer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
