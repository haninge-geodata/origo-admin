'use client';
import React from 'react';
import AppBarComponent from '@/components/Header/Header';
import DrawerComponent from '@/components/Drawer/Drawer';

export default function Navigation() {
    return (
        <>
            <AppBarComponent />
            <DrawerComponent />
        </>
    );
}