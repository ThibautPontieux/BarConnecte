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
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onViewChange,
}) => {
  const pendingOrdersCount = useOrderStore((state) => state.getPendingOrders().length);

  const navItems: NavItem[] = [
    {
      key: 'client',
      label: 'Bar',
      icon: Home,
    },
    {
      key: 'barman',
      label: 'Commandes',
      icon: Clock,
      badge: pendingOrdersCount,
    },
    {
      key: 'admin',
      label: 'Admin',
      icon: Settings,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:relative md:shadow-none">
      <div className="flex">
        {navItems.map(({ key, label, icon: Icon, badge }) => (
          <button
            key={key}
            onClick={() => onViewChange(key)}
            className={`flex-1 p-4 text-center relative ${
              currentView === key ? 'bg-amber-600 text-white' : 'text-gray-600'
            }`}
          >
            <Icon className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs">{label}</span>
            {badge !== undefined && badge >= 0 && (
              <Badge
                variant="danger"
                className="absolute top-1 right-1/4 min-w-[16px] h-4 flex items-center justify-center text-xs px-1"
              >
                {badge}
              </Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
