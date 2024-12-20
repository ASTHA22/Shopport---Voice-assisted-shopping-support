import { Hero } from "../components/Hero";
import { ProductGrid } from "../components/ProductGrid";
import { VoiceControl } from "../components/VoiceControl";
import { CartDrawer } from "../components/CartDrawer";
import { InstallPrompt } from "../components/InstallPrompt";
import { useToast } from "@/hooks/use-toast";
import { useCallback, useState } from "react";
import { useLocation } from "wouter";
import { queryClient } from "../lib/queryClient";

export function Home() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleAddToCart = async (productId: number) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity: 1,
          sessionId: "temp-session",
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      // Invalidate the cart query to trigger a refresh
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      
      toast({
        title: "Success",
        description: "Item added to cart successfully",
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    toast({
      title: "Searching",
      description: `Searching for: ${query}`,
    });
    // Scroll to the products section
    document.querySelector('.featured-products')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }, [toast]);

  const handleNavigate = useCallback((path: string) => {
    setLocation(`/${path}`);
  }, [setLocation]);

  return (
    <div>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Shopport</h1>
          <div className="flex items-center gap-4">
            <InstallPrompt />
            <CartDrawer />
          </div>
        </div>
      </header>

      <main className="pt-16">
        <Hero />
        
        <section className="container mx-auto px-4 py-16 featured-products">
          <h2 className="text-3xl font-bold mb-8">{searchQuery ? `Search Results: ${searchQuery}` : 'Featured Products'}</h2>
          <ProductGrid onAddToCart={handleAddToCart} searchQuery={searchQuery} />
        </section>

        <VoiceControl
          onSearch={handleSearch}
          onNavigate={handleNavigate}
          isListening={isListening}
          setIsListening={setIsListening}
        />
      </main>
    </div>
  );
}
