import React, { useState } from 'react';
import { Navigation, ViewType } from './components/layout/Navigation';
import { BarView } from './pages/client/BarView';
import { Dashboard } from './pages/admin/Dashboard';
import { OrderManagement } from './pages/barman/OrderManagement';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('client');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'client':
        return <BarView />;
      case 'admin':
        return <Dashboard />;
      case 'barman':
        return <OrderManagement />;
      default:
        return <BarView />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <div className="pb-16 md:pb-0">{renderCurrentView()}</div>
    </div>
  );
};

export default App;
