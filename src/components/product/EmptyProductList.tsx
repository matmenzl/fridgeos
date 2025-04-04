
import React from 'react';

const EmptyProductList: React.FC = () => {
  return (
    <div className="text-center p-8 bg-muted rounded-lg">
      <p className="text-muted-foreground">
        Keine Lebensmittel vorhanden. Erfasse dein erstes Produkt!
      </p>
    </div>
  );
};

export default EmptyProductList;
