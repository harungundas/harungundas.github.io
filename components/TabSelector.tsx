import React from 'react';
import { EditIcon } from './icons/EditIcon';
import { FaceSwapIcon } from './icons/FaceSwapIcon';
import { FunnyIcon } from './icons/FunnyIcon';
import { ActiveTab } from '../App';

interface TabSelectorProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const TabButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    label: string;
    children: React.ReactNode;
}> = ({ isActive, onClick, label, children }) => {
    const baseClasses = "flex items-center justify-center sm:justify-start w-full sm:w-auto gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
    const activeClasses = "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg";
    const inactiveClasses = "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white";

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        >
            {children}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
};

const TabSelector: React.FC<TabSelectorProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="flex justify-center sm:justify-start flex-wrap gap-2 sm:gap-4 p-2 bg-black/20 rounded-xl shadow-md">
      <TabButton
        isActive={activeTab === 'realisticEdit'}
        onClick={() => setActiveTab('realisticEdit')}
        label="Estetik Düzenleme"
      >
        <EditIcon />
      </TabButton>
      <TabButton
        isActive={activeTab === 'funnyEdit'}
        onClick={() => setActiveTab('funnyEdit')}
        label="Komik Düzenleme"
      >
        <FunnyIcon />
      </TabButton>
      <TabButton
        isActive={activeTab === 'faceMontage'}
        onClick={() => setActiveTab('faceMontage')}
        label="Yüz Montajı"
      >
        <FaceSwapIcon />
      </TabButton>
    </nav>
  );
};

export default TabSelector;