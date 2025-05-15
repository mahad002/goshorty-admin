import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface SidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    console.log('Toggling sidebar. Current state:', isSidebarOpen);
    setIsSidebarOpen(prevState => !prevState);
  }, [isSidebarOpen]);

  const openSidebar = useCallback(() => {
    console.log('Opening sidebar');
    setIsSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    console.log('Closing sidebar');
    setIsSidebarOpen(false);
  }, []);
  
  // Debug sidebar state changes
  useEffect(() => {
    console.log('Sidebar state changed to:', isSidebarOpen);
  }, [isSidebarOpen]);

  const contextValue = {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    openSidebar
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}; 