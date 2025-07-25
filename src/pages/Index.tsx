import React from 'react';
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';

const Index = () => {
  // Featured products (first 3)
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Hero />

      {/* Featured Products Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Collection
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our most popular handmade soaps, loved by customers worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="text-center animate-slide-up">
            <Link to="/products">
              <Button variant="premium" size="lg">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-muted-foreground">
              Real reviews from real customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background rounded-lg p-6 shadow-soft animate-scale-in">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-accent fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "The GOLDEN GLOW soap has transformed my skin! It's so gentle yet effective. 
                I love the natural ingredients and the beautiful packaging."
              </p>
              <div className="font-semibold text-foreground">Sarah M.</div>
            </div>

            <div className="bg-background rounded-lg p-6 shadow-soft animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-accent fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "VilĀura soaps are amazing! The CAFFÉSKIN soap gives me such an energizing 
                start to my day. Highly recommend to anyone looking for natural skincare."
              </p>
              <div className="font-semibold text-foreground">Michael R.</div>
            </div>

            <div className="bg-background rounded-lg p-6 shadow-soft animate-scale-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-accent fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "I have sensitive skin and the KESUDA SOAP is perfect for me. 
                It's so gentle and moisturizing. Will definitely order again!"
              </p>
              <div className="font-semibold text-foreground">Emma L.</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
