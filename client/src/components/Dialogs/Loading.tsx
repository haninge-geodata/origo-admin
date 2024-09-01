import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

interface LoadingProps {
    open: boolean;
    onClose: () => void;
}

const Loading: React.FC<LoadingProps> = ({ open, onClose }) => {
    return (
        <div>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme: any) => theme.zIndex.drawer + 1 }}
                open={open}
                onClick={onClose}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    );
};

export default Loading;
