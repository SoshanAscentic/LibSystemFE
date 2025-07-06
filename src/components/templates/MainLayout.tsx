import React from 'react';
import { Sidebar } from '../organisms/Sidebar';
import { Header } from '../organisms/Header'; // You'll need to create this if it doesn't exist

interface MainLayoutProps {
  children: React.ReactNode;
  userRole?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  userRole = 'Member' 
}) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        <Sidebar userRole={userRole} />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};