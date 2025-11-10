import React, { useState } from 'react';
import Header from './components/Header';
import ImageEditor from './components/ImageEditor';
import TabSelector from './components/TabSelector';
import FaceMontage from './components/FaceMontage';

export type ActiveTab = 'realisticEdit' | 'funnyEdit' | 'faceMontage';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('realisticEdit');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'realisticEdit':
        return <ImageEditor key="realistic" defaultGeneratorType="realistic" />;
      case 'funnyEdit':
        return <ImageEditor key="funny" defaultGeneratorType="funny" />;
      case 'faceMontage':
        return <FaceMontage />;
      default:
        return <ImageEditor key="realistic" defaultGeneratorType="realistic" />;
    }
  };

  return (
    <div className="min-h-screen text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <Header />
        <main className="mt-6 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-8">
          <div className="mb-8">
            <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
};

export default App;