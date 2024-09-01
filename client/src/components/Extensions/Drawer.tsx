import { styled } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import { closedMixin, openedMixin } from "@/components/Drawer/DrawerStyles";
import { DRAWER_WIDTH } from '@/constants/';

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(

    ({ theme, open }) => ({
        width: DRAWER_WIDTH,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);
export default Drawer;