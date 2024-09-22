"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';
import { Snackbar, CircularProgress, Backdrop } from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { globalEventEmitter } from '../utils/EventEmitter';
import { usePathname } from 'next/navigation';

interface AppContextType {
    setLoading: (isLoading: boolean) => void;
    showToast: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
    showToastAfterNavigation: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; severity: AlertProps['severity'] } | null>(null);
    const pathname = usePathname();
    const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showToast = (message: string, severity: AlertProps['severity']) => {
        setToast({ message, severity });
    };

    const showToastAfterNavigation = (message: string, severity: AlertProps['severity']) => {
        localStorage.setItem('pendingToast', JSON.stringify({ message, severity }));
    };

    useEffect(() => {
        const pendingToast = localStorage.getItem('pendingToast');
        if (pendingToast) {
            const { message, severity } = JSON.parse(pendingToast);
            showToast(message, severity);
            localStorage.removeItem('pendingToast');
        }
    }, [pathname]);

    useEffect(() => {
        console.log('AppProvider mounted');
        const loadingListener = (isLoading: boolean) => {
            console.log('Received loading event:', isLoading);
            if (isLoading) {
                setLoading(true);
            } else {
                if (loadingTimeoutRef.current) {
                    clearTimeout(loadingTimeoutRef.current);
                }
                loadingTimeoutRef.current = setTimeout(() => {
                    setLoading(false);
                }, 10);
            }
        };

        const errorListener = (message: string) => {
            console.log('Received error event:', message);
            showToast(message, 'error');
        };

        const successListener = (message: string) => {
            console.log('Received success event:', message);
            showToast(message, 'success');
        };

        //globalEventEmitter.on('loading', loadingListener);
        globalEventEmitter.on('error', errorListener);
        globalEventEmitter.on('success', successListener);

        return () => {
            globalEventEmitter.off('loading', loadingListener);
            globalEventEmitter.off('error', errorListener);
            globalEventEmitter.off('success', successListener);
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
            }
        };
    }, []);

    return (
        <AppContext.Provider value={{ setLoading, showToast, showToastAfterNavigation }}>
            {children}
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                }}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Snackbar
                open={!!toast}
                autoHideDuration={6000}
                onClose={() => setToast(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                {toast ? (
                    <MuiAlert elevation={6} variant="filled" severity={toast.severity}>
                        {toast.message}
                    </MuiAlert>
                ) : undefined}
            </Snackbar>
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

export const getAppContext = (): AppContextType => {
    const context = React.useContext(AppContext);
    if (context === undefined) {
        throw new Error('getAppContext must be used within an AppProvider');
    }
    return context;
};