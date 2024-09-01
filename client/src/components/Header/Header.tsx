'use client';
import React, { useState, useEffect } from 'react';
import { Toolbar, Typography, IconButton } from '@mui/material';
import { Menu, Lock, GitHub, MenuOpen, InfoOutlined } from '@mui/icons-material';
import useStore from "@/stores/Navigation";
import { AppBar } from "@/components/Extensions/AppBar";
import AlertDialog from '../Dialogs/AlertDialog';
import envStore from "@/stores/Environment";
import { signOut, useSession } from "next-auth/react"
import { useRouter } from 'next/navigation';

export default function AppBarComponent() {
    const { isDrawerOpen, toggleDrawer } = useStore();
    const [githubUrl, setGithubUrl] = useState('');
    const [version, setVersion] = useState('');
    const [published, setPublished] = useState('');
    const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
    const [isAuthEnabled, setIsAuthEnabled] = useState(false);
    const [signOutUrl, setSignOutUrl] = useState('');
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        async function fetchEnvVars() {
            const fetchedGithubUrl = await envStore("GITHUB_URL");
            const fetchedVersion = await envStore("VERSION");
            const fetchedPublished = await envStore("UPDATED");
            const fetchedAuthEnabled = await envStore("AUTH_ENABLED");
            const fetchedSignOutUrl = await envStore("SIGN_OUT_URL");

            if (fetchedAuthEnabled === undefined)
                setIsAuthEnabled(true);
            else
                setIsAuthEnabled(fetchedAuthEnabled === "true" || false);

            setGithubUrl(fetchedGithubUrl);
            setVersion(fetchedVersion);
            setPublished(fetchedPublished);
            setSignOutUrl(fetchedSignOutUrl);
        }

        fetchEnvVars();
    }, []);

    const handleGitHubClick = () => {
        if (githubUrl) {
            window.location.href = githubUrl;
        }
    };

    const handleInfoClick = () => {
        setIsInfoDialogOpen(true);
    };

    const handleLogout = async () => {
        sessionStorage.clear();
        await signOut({ redirect: false });
        if (signOutUrl) {
            window.location.href = signOutUrl;
        } else {
            router.push('/');
        }
    };

    const contextText = `Origo Admin är en applikation för att hantera kartor och kartinstanser för Origo.` +
        `<p>Version: ${version}</br>` +
        `Uppdaterad: ${published}</p>`;

    return (
        <AppBar position="fixed" open={isDrawerOpen} >
            <Toolbar>
                <IconButton
                    aria-label="open drawer"
                    onClick={toggleDrawer}
                    edge="start"
                    sx={{
                        marginRight: 'auto'
                    }}
                >
                    {isDrawerOpen ? <MenuOpen /> : <Menu />}
                </IconButton>
                <div style={{ flexGrow: 1 }} />
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={handleInfoClick} sx={{ color: 'grey.600' }}>
                        <InfoOutlined />
                    </IconButton>
                    <IconButton onClick={handleGitHubClick} sx={{ color: 'grey.600' }}>
                        <GitHub />
                    </IconButton>
                    {isAuthEnabled && (<>
                        <IconButton onClick={handleLogout} sx={{ color: 'grey.600' }}>
                            <Lock sx={{ ml: 1, mr: 1, color: 'grey.600' }} />
                        </IconButton>
                        {session && session.user && <Typography variant="h6" style={{ color: 'black' }}>
                            Inloggad som: {session.user.name}
                        </Typography>}
                    </>)}
                </div>
            </Toolbar>
            <AlertDialog open={isInfoDialogOpen} title="Origo Admin" contentText={contextText} onClose={() => setIsInfoDialogOpen(false)} />
        </AppBar>
    );
}