'use client';
import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import Logo from "@/components/Drawer/Logo/Logo";
import { useRouter, usePathname } from "next/navigation";
import Drawer from "@/components/Extensions/Drawer";
import useStore from "@/stores/Navigation";
import staticMenuItems from '@/assets/config/menuitems.json';
import { getIcon } from "@/utils/helpers/iconHelper";
import envStore from '@/stores/Environment';
import { schemaService } from '@/api/schemaService';
import { globalEventEmitter } from '@/utils/EventEmitter';

export default function DrawerComponent() {
    const [activeItemId, setActiveItemId] = useState(0);
    const [menuItems, setMenuItems] = useState<any[]>(staticMenuItems);
    const router = useRouter();
    const pathname = usePathname();
    const { isDrawerOpen, openDrawer } = useStore();
    const [isAuthEnabled, setIsAuthEnabled] = useState(false);


    useEffect(() => {
        async function fetchEnvVars() {
            const fetchedAuthEnabled = await envStore("AUTH_ENABLED");
            if (fetchedAuthEnabled === undefined)
                setIsAuthEnabled(true);
            else
                setIsAuthEnabled(fetchedAuthEnabled === "true" || false);
        }
        fetchEnvVars();
    }, []);

    useEffect(() => {
        async function fetchDynamicMenuItems() {
            try {
                const dynamicItems = await schemaService.fetchMenuItems();

                const mergedMenuItems = staticMenuItems.map((group: any) => {
                    if (group.id === 30 && group.name === "Lager") {
                        return {
                            ...group,
                            children: [...group.children, ...dynamicItems]
                        };
                    }
                    return group;
                });

                setMenuItems(mergedMenuItems);
            } catch (error) {
                console.error('[Drawer] Failed to fetch dynamic menu items:', error);
                setMenuItems(staticMenuItems);
            }
        }

        fetchDynamicMenuItems();

        const handleSchemaChange = () => {
            console.log('[Drawer] Schema changed, refreshing menu...');
            fetchDynamicMenuItems();
        };

        globalEventEmitter.on('schema-changed', handleSchemaChange);

        return () => {
            globalEventEmitter.off('schema-changed', handleSchemaChange);
        };
    }, []);

    useEffect(() => {
        openDrawer();
    }, [openDrawer]);

    useEffect(() => {
        const findActiveItem = () => {

            for (const group of menuItems) {
                for (const item of group.children || []) {
                    if (item.urlSegment == pathname) {
                        return item.id;
                    }
                }
            }
            return 0;
        };

        setActiveItemId(findActiveItem());
    }, [pathname]);


    const handleListItemClick = (itemId: number, urlSegment?: string) => {
        setActiveItemId(itemId);
        if (urlSegment) {
            router.push(urlSegment);
        }
    };

    const handleLogoClick = () => {
        setActiveItemId(0);
        router.push('/');
    };

    const BACKGROUND_COLOR = '#1890ff';
    const BACKGROUND_COLOR_HOVER = '#e6f7ff';

    return (
        <Drawer variant="permanent" open={isDrawerOpen}>
            <div style={{ display: 'flex', alignItems: 'center' }} >
                <Logo onClick={handleLogoClick} />
            </div>
            {menuItems.map((group) => (
                (!group.requiresAuth || (group.requiresAuth && isAuthEnabled)) && (
                    <List key={group.id}>
                        <Typography variant="subtitle2" sx={{ ml: 2, mb: 1, opacity: isDrawerOpen ? 1 : 0 }}>{group.name}</Typography>
                        {group.children?.map((item: any) => (
                            <ListItem key={item.id} disablePadding
                                sx={{
                                    display: 'block', '&:hover': { backgroundColor: BACKGROUND_COLOR_HOVER },
                                    backgroundColor: activeItemId === item.id ? '#e6f7ff' : 'inherit',
                                    borderRight: activeItemId == item.id ? '2px solid #334c63' : 'inherit',
                                    color: activeItemId == item.id ? BACKGROUND_COLOR : 'inherit'
                                }}>
                                <ListItemButton
                                    disabled={item.disabled}
                                    onClick={() => handleListItemClick(item.id, item.urlSegment)}
                                    sx={{
                                        minHeight: 48,
                                        justifyContent: isDrawerOpen ? 'initial' : 'center',
                                        px: 2.5,
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: isDrawerOpen ? 3 : 'auto',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {getIcon(item.icon, activeItemId === item.id ? BACKGROUND_COLOR : undefined)}
                                    </ListItemIcon>
                                    <ListItemText primary={item.name} sx={{
                                        opacity: isDrawerOpen ? 1 : 0,
                                        color: activeItemId == item.id ? BACKGROUND_COLOR : 'inherit'
                                    }} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                )
            ))}
        </Drawer>
    );
}