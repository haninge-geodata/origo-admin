import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


interface AlertDialogProps {
  title: string;
  contentText: string;
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function AlertDialog({ open, title, contentText, onClose, onConfirm }: AlertDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description"
          dangerouslySetInnerHTML={{ __html: contentText }}>
        </DialogContentText>
      </DialogContent>
      {onConfirm &&
        <DialogActions>
          <Button onClick={onClose}>Avbryt</Button>
          <Button onClick={onConfirm} autoFocus>
            Ok
          </Button>
        </DialogActions>}
      {onConfirm === undefined &&
        <Button onClick={onClose}>Stäng</Button>
      }
    </Dialog>
  );
}