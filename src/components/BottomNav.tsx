import React from 'react';
import { BookOpen, Search, Bookmark, BarChart2 } from 'lucide-react';

export type NavTab = 'library' | 'search' | 'saved' | 'stats';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'library' as NavTab, label: 'Library', icon: BookOpen },
    { id: 'search' as NavTab, label: 'Search', icon: Search },
    { id: 'saved' as NavTab, label: 'Saved', icon: Bookmark },
    { id: 'stats' as NavTab, label: 'Stats', icon: BarChart2 },
  ];

  return (
    <nav
      id="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-30 max-w-[420px] mx-auto bg-[#F5EDE0]/95 backdrop-blur-md border-t border-black/8 pt-2 pb-1.5 px-6 flex flex-col"
    >
      <div className="flex items-center justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all py-1 px-2.5 rounded-xl ${
                isActive
                  ? 'text-neutral-950 font-bold scale-105'
                  : 'text-neutral-400 hover:text-neutral-600 font-medium'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'stroke-[2.5] text-neutral-950' : 'stroke-[1.8]'
                }`}
              />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div className="pt-1.5 pb-0.5 text-center border-t border-black/5 mt-1">
        <p className="text-[10px] text-neutral-500 font-medium tracking-tight">
          Project by <span className="font-bold text-neutral-800">Siddhant Bhandare</span> •{' '}
          <a
            href="mailto:siddhantbhandare1@gmail.com"
            className="text-[#E8543C] hover:underline font-medium"
          >
            siddhantbhandare1@gmail.com
          </a>
        </p>
      </div>
    </nav>
  );
};
