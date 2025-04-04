
import React from 'react';
import { ShoppingCart, Utensils, Refrigerator, Sparkles } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero section with gradient background */}
      <header className="bg-gradient-to-r from-green-500 to-teal-600 py-16 px-4 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">FridgeWhisper</h1>
        <p className="text-xl max-w-2xl mx-auto">
          Reduce food waste with smart refrigerator management 
          and AI-powered recipe suggestions
        </p>
      </header>

      {/* Get Started Section */}
      <section className="py-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Get Started</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Shopping Card */}
          <Card className="border shadow-sm">
            <CardContent className="pt-6 pb-6 px-6 flex flex-col items-center text-center">
              <div className="mb-6 text-orange-500">
                <ShoppingCart size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Plan Your Shopping</h3>
              <p className="text-gray-600 mb-8">
                Create smart shopping lists based on your current inventory
              </p>
              <Button className="w-full bg-green-500 hover:bg-green-600">
                Plan Shopping
              </Button>
            </CardContent>
          </Card>

          {/* Recipes Card */}
          <Card className="border shadow-sm">
            <CardContent className="pt-6 pb-6 px-6 flex flex-col items-center text-center">
              <div className="mb-6 text-teal-500">
                <Utensils size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Discover Recipes</h3>
              <p className="text-gray-600 mb-8">
                Get AI-powered recipe suggestions based on what you have
              </p>
              <Button className="w-full bg-green-500 hover:bg-green-600">
                Find Recipes
              </Button>
            </CardContent>
          </Card>

          {/* Inventory Card */}
          <Card className="border shadow-sm">
            <CardContent className="pt-6 pb-6 px-6 flex flex-col items-center text-center">
              <div className="mb-6 text-green-500">
                <Refrigerator size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Manage Your Inventory</h3>
              <p className="text-gray-600 mb-8">
                Keep track of what's in your fridge with camera and voice assistance
              </p>
              <Button className="w-full bg-green-500 hover:bg-green-600">
                Open Inventory
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Food Waste Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-amber-400 flex justify-center mb-4">
            <Sparkles size={48} />
          </div>
          <h2 className="text-3xl font-bold mb-6">Reduce Food Waste</h2>
          <p className="text-gray-600 text-lg">
            FridgeWhisper helps you track expiration dates, suggests recipes for
            ingredients about to expire, and plans your shopping more efficiently.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
