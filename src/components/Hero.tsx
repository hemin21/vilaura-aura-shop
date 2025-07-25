import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-primary/20"></div>
        <div className="absolute bottom-32 right-20 w-24 h-24 rounded-full bg-accent/20"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-primary-glow/20"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* Brand Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-accent rounded-full shadow-glow mb-8">
            <Leaf className="w-10 h-10 text-accent-foreground" />
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Vil<span className="text-primary">Ā</span>ura
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 font-light">
            Handcrafted Natural Soaps
          </p>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover our luxurious collection of handmade herbal soaps, crafted with the finest natural ingredients to nourish and pamper your skin.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/products">
              <Button size="lg" variant="premium" className="text-lg px-8 py-3">
                Shop Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto">
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">100% Natural</h3>
              <p className="text-sm text-muted-foreground">Made with pure, organic ingredients</p>
            </div>
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L22 12L13.09 15.74L12 22L10.91 15.74L2 12L10.91 8.26L12 2Z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Handcrafted</h3>
              <p className="text-sm text-muted-foreground">Carefully made in small batches</p>
            </div>
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Skin Loving</h3>
              <p className="text-sm text-muted-foreground">Gentle and nourishing formulas</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;