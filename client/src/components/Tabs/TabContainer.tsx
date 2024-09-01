import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';

interface TabContainerProps {
    items: { id: number; label: string }[];
    children: React.ReactNode[];
}

export const TabContainer: React.FC<TabContainerProps> = ({ items, children }) => {
    const [value, setValue] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box component='div' sx={{ width: '100%' }}>
            <Tabs
                value={value}
                onChange={handleTabChange}
                textColor="secondary"
                indicatorColor="secondary"
                aria-label="secondary tabs example"
            >
                {items.map((item) => (
                    <Tab key={item.id} value={item.id} label={item.label} />
                ))}
            </Tabs>
            {children.map((child, index) => (
                <TabPanel key={index} value={value} index={index}>
                    {child}
                </TabPanel>
            ))}
        </Box>
    );
};

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box component='div' sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
};
