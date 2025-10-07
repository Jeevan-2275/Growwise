'use client';

import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TimelineIcon from '@mui/icons-material/Timeline';
import CalculateIcon from '@mui/icons-material/Calculate';
import ChatIcon from '@mui/icons-material/Chat';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const drawerWidth = 240;

export default function AppSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const Item = ({ href, icon, label }: any) => (
    <Link href={href} prefetch>
      <ListItemButton selected={pathname === href} onClick={onClose}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={label} />
      </ListItemButton>
    </Link>
  );

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        <Item href="/" icon={<DashboardIcon />} label="Dashboard" />
        <Item href="/(funds)" icon={<TimelineIcon />} label="Funds" />
        <Item href="/(tools)/calculators/sip" icon={<CalculateIcon />} label="Calculators" />
        <Item href="/(dashboard)" icon={<ChatIcon />} label="AI Chat" />
      </List>
    </Drawer>
  );
}