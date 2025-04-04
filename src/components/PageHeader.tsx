
import React from 'react';

const PageHeader = () => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm p-4 md:p-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lebensmittel-Tracker</h1>
        <p className="text-gray-500 text-sm">Behalte den Überblick über deine Lebensmittel</p>
      </div>
    </header>
  );
};

export default PageHeader;
