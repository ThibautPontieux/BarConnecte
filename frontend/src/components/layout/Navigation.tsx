import React from 'react';
import { Home, Clock, Settings, type LucideIcon } from 'lucide-react';
import { useOrderStore } from '../../stores/useOrderStore';
import { Badge } from '../ui/Badge';

export type ViewType = 'client' | 'admin' | 'barman';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

interface NavItem {
  key: ViewType;
  label: string;
  icon: LucideIcon;
  badge?: number;
  description: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onViewChange,
}) => {
  // Obtenir le nombre de commandes en attente pour le badge
  const pendingOrdersCount = useOrderStore((state) => {
    const pendingOrders = state.orders.filter(order => order.status === 'pending');
    return pendingOrders.length;
  });

  const navItems: NavItem[] = [
    {
      key: 'client',
      label: 'Bar',
      icon: Home,
      description: 'Commander des boissons',
    },
    {
      key: 'barman',
      label: 'Commandes',
      icon: Clock,
      badge: pendingOrdersCount,
      description: 'Gérer les commandes',
    },
    {
      key: 'admin',
      label: 'Admin',
      icon: Settings,
      description: 'Gérer les stocks',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:relative md:shadow-none md:border-r md:border-t-0 md:h-screen md:w-64 md:min-w-[16rem]">
      <div className="flex md:flex-col md:h-full">
        
        {/* En-tête sur desktop */}
        <div className="hidden md:block p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">DrinkIT</h2>
          <p className="text-sm text-gray-600">Gestion de bar</p>
        </div>

        {/* Navigation */}
        <nav className="flex md:flex-col md:flex-1 md:p-4">
          {navItems.map(({ key, label, icon: Icon, badge, description }) => {
            const isActive = currentView === key;
            
            return (
              <button
                key={key}
                onClick={() => onViewChange(key)}
                className={`
                  flex-1 md:flex-none p-4 md:p-3 text-center md:text-left relative 
                  transition-colors rounded-none md:rounded-lg md:mb-2
                  ${
                    isActive
                      ? 'bg-amber-600 text-white md:bg-amber-100 md:text-amber-800 md:border md:border-amber-200'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }
                `}
                title={description}
              >
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {badge !== undefined && badge > 0 && (
                      <Badge
                        variant="danger"
                        className="absolute -top-2 -right-2 min-w-[16px] h-4 flex items-center justify-center text-xs px-1 md:relative md:top-0 md:right-0 md:ml-2"
                      >
                        {badge}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="hidden md:block">
                    <div className="font-medium">{label}</div>
                    <div className="text-xs opacity-75">{description}</div>
                  </div>
                </div>
                
                {/* Label mobile */}
                <span className="text-xs mt-1 md:hidden">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer sur desktop */}
        <div className="hidden md:block p-4 border-t">
          <div className="text-xs text-gray-500">
            <p>DrinkIT v2.0</p>
            <p>Système de gestion de bar</p>
          </div>
        </div>
      </div>
    </div>
  );
};
