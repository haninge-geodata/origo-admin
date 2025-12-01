import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Alert } from "@mui/material";
import { useState } from "react";

interface FormDialogProps {
    title: string;
    contentText: string;
    open: boolean;
    fieldToValidate: string;
    errorMessage?: string | null;
    onClose: () => void;
    onSubmit: (e: FormData) => void;
    textField: React.ReactNode;
}

export default function FormDialog({ open, onClose, onSubmit, title, fieldToValidate, contentText, textField, errorMessage }: FormDialogProps) {
    const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(null);

    const handleSubmit = (event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLDivElement>) => {
        event.preventDefault();
        const form = (event.target as HTMLButtonElement).closest('form');
        if (form) {
            const formData = new FormData(form);
            console.log(`[${new Date().toISOString()}] Submitting form data:\n${JSON.stringify(formData, null, 2)}`);
            const name = formData.get(fieldToValidate)?.toString().trim();

            if (!name) {
                setLocalErrorMessage("Värde måste anges...");
                return;
            }

            setLocalErrorMessage(null);
            onSubmit(formData);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    handleSubmit(e);
                } else if (e.key === 'Escape') {
                    onClose();
                }
            }}
            PaperProps={{
                component: 'form',
                onSubmit: onSubmit
            }}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {(localErrorMessage || errorMessage) && <Alert severity="error">{localErrorMessage || errorMessage}</Alert>}
                <DialogContentText>
                    {contentText}
                </DialogContentText>
                {textField}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Avbryt</Button>
                <Button onClick={handleSubmit}>Skapa</Button>
            </DialogActions>
        </Dialog>
    );
}