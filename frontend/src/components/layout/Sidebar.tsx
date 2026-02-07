import { ReactNode } from 'react';

interface SidebarProps {
  children: ReactNode;
}

const Sidebar = ({ children }: SidebarProps) => {
  return (
    <aside style={{
      position: 'sticky',
      top: '80px',
      height: 'fit-content',
    }}>
      {children}
    </aside>
  );
};

export default Sidebar;
