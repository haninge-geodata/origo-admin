'use client';
import { PublishedMapConfigDto } from '@/shared/interfaces/dtos';
import { useEffect } from 'react';

interface OrigoComponentProps {
    json: PublishedMapConfigDto;
}

function OrigoComponent({ json }: OrigoComponentProps) {
    useEffect(() => {
        const loadOrigoScript = () => {
            const script = document.createElement('script');
            const basePath = process.env.NEXT_PUBLIC_BASE_PATH;
            script.src = `${basePath}/origo/lib/origo.min.js`;
            script.onload = () => initializeOrigo();
            document.body.appendChild(script);
        };

        const initializeOrigo = () => {
            if (window.Origo && document.getElementById('app-wrapper')) {

                const configObject = JSON.parse(JSON.stringify(json));
                const basePath = process.env.NEXT_PUBLIC_BASE_PATH;
                const origo = window.Origo(configObject, {
                    baseUrl: `${basePath}/origo/`
                });
            } else {
                console.error(`[${new Date().toISOString()}] Failed to initialize Origo.`);
            }
        };

        if (document.getElementById('app-wrapper')) {
            loadOrigoScript();
        } else {
            console.error(`[${new Date().toISOString()}] app-wrapper not found`);
        }
    }, [json]);

    return <div id="app-wrapper" style={{ height: '80vh', width: '90vh' }}>Kartan laddas...</div>;
}

export default OrigoComponent;