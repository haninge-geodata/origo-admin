import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import AlertDialog from "@/components/Dialogs/AlertDialog";
import FormDialog from "@/components/Dialogs/FormDialog";
import { TextField } from "@mui/material";
import { MapInstanceService as service } from '@/api';

interface PublishMapFormDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    id: string | null;
};

export default function PublishMapFormDialog({ open, onClose, onConfirm, id }: PublishMapFormDialogProps) {
    const [isConfirmPublishDialogOpen, setConfirmPublishDialogOpen] = useState(open);
    const [publishComment, setPublishComment] = useState<string>();
    const { showToast } = useApp();

    const handleSubmitPublish = (formData: FormData) => {
        setPublishComment(formData.get("comment")?.toString().trim());
        onClose();
        setConfirmPublishDialogOpen(true);
    };

    const handleConfirmPublish = async () => {
        try {
            await service.publish(id || "", publishComment);
            showToast('Kartinstansen publicerades!', 'success');
            setPublishComment(undefined);
        } catch (error) {
            showToast('Ett fel inträffade, kunde inte publicera kartinstans', 'error');
            console.error(`[${new Date().toISOString()}] ${error}`);
        }
        onConfirm();
        setConfirmPublishDialogOpen(false);
    };

    return (
        <div>
            <FormDialog title="Publicera kartinstans" contentText="Beskriv vad som är förändrat i kartinstansen sedan senaste publiceringen. Det ska gå att avgöra vilken som ska ompubliceras om en äldre fungerande version behöver återställas."
                open={open} onClose={onClose}
                onSubmit={handleSubmitPublish}
                fieldToValidate="comment"
                textField={<TextField
                    autoFocus
                    onChange={(e) => setPublishComment(e.target.value)}
                    required
                    defaultValue={publishComment}
                    margin="dense"
                    id="comment"
                    name="comment"
                    label="Kommentar - vad har ändrats?"
                    type="text"
                    fullWidth
                    multiline
                    rows={2}
                    variant="filled"
                />}
            />
            <AlertDialog title={`Publicera kartinstans?`}
                contentText={`Bekräfta publicering av kartinstans, detta kommer ersätta eventuellt existerande kartinstans!`}
                open={isConfirmPublishDialogOpen} onClose={() => setConfirmPublishDialogOpen(false)} onConfirm={handleConfirmPublish} />
        </div>
    );
}