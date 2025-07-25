import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Heart, Star, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About Vil<span className="text-primary">Ā</span>ura
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Born from a passion for natural beauty and wellness, VilĀura creates handcrafted soaps 
            that nurture both your skin and spirit. Each bar tells a story of traditional craftsmanship 
            meets modern luxury.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="animate-slide-up">
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                VilĀura began as a dream to create something beautiful and beneficial for everyday life. 
                Founded on the belief that skincare should be both luxurious and natural, we set out to 
                craft soaps that would transform the simple act of cleansing into a moment of pure indulgence.
              </p>
              <p>
                Every bar of VilĀura soap is meticulously handcrafted in small batches, ensuring the highest 
                quality and attention to detail. We source our ingredients from trusted suppliers who share 
                our commitment to sustainability and ethical practices.
              </p>
              <p>
                Our name, VilĀura, represents the golden aura of natural wellness that we strive to bring 
                to your daily routine. Each product is infused with the healing power of herbs, the purity 
                of essential oils, and the love of traditional soap-making artistry.
              </p>
            </div>
          </div>
          
          <div className="animate-scale-in">
            <div className="bg-gradient-card rounded-2xl p-8 shadow-card">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Leaf className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">100% Natural</h3>
                  <p className="text-sm text-muted-foreground">Pure ingredients from nature</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Made with Love</h3>
                  <p className="text-sm text-muted-foreground">Crafted with care and passion</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Premium Quality</h3>
                  <p className="text-sm text-muted-foreground">Uncompromising standards</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Handcrafted</h3>
                  <p className="text-sm text-muted-foreground">Traditional artisan methods</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12 animate-fade-in">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center animate-scale-in border-border shadow-soft">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <Leaf className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Sustainability</h3>
                <p className="text-muted-foreground">
                  We're committed to environmental responsibility, using biodegradable ingredients 
                  and eco-friendly packaging.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center animate-scale-in border-border shadow-soft">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Wellness</h3>
                <p className="text-muted-foreground">
                  Every product is designed to promote not just clean skin, but overall 
                  well-being and mindful self-care.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center animate-scale-in border-border shadow-soft">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Quality</h3>
                <p className="text-muted-foreground">
                  We never compromise on quality, ensuring each bar meets our rigorous 
                  standards for purity and effectiveness.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Process Section */}
        <div className="bg-gradient-card rounded-2xl p-8 md:p-12 shadow-card animate-slide-up">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Our Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground font-bold">1</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Source</h3>
              <p className="text-sm text-muted-foreground">
                We carefully select the finest natural ingredients from trusted suppliers.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground font-bold">2</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Craft</h3>
              <p className="text-sm text-muted-foreground">
                Each bar is handmade using traditional soap-making techniques.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground font-bold">3</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Cure</h3>
              <p className="text-sm text-muted-foreground">
                Our soaps are aged to perfection, developing their unique properties.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground font-bold">4</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Package</h3>
              <p className="text-sm text-muted-foreground">
                Beautifully packaged with care, ready to bring joy to your routine.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;