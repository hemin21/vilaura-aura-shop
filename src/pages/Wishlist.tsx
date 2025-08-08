import React, { useState } from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export const Wishlist = () => {
  const [wishlistItems] = useState([
    {
      id: '1',
      product_id: 'caffeeskin',
      created_at: '2024-01-15',
      products: {
        id: 'caffeeskin',
        name: 'CAFFÉSKIN',
        description: 'Energizing coffee-infused herbal soap',
        price: 50,
        image_url: '/lovable-uploads/a470358d-bb23-48cf-a954-95f37d24b288.png',
        category: 'Herbal Soap',
        stock_quantity: 10,
        is_active: true
      }
    }
  ]);
  const [loading] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart();

  const removeFromWishlist = async (wishlistId: string) => {
    toast.info('Wishlist feature will be fully functional once database is ready');
  };

  const moveToCart = (item: any) => {
    addToCart({
      id: item.products.id,
      name: item.products.name,
      description: item.products.description,
      price: item.products.price,
      image: item.products.image_url,
      category: item.products.category,
      weight: '100gm',
      ingredients: []
    });
    toast.success('Item moved to cart');
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Please Log In</h1>
        <p className="text-muted-foreground mb-4">
          You need to be logged in to view your wishlist.
        </p>
        <Link to="/auth">
          <Button>Log In</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading your wishlist...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="h-6 w-6" />
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <Badge variant="secondary">{wishlistItems.length} items</Badge>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-4">
            Start adding products you love to your wishlist.
          </p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="relative mb-4">
                  <img
                    src={item.products.image_url}
                    alt={item.products.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <h3 className="font-semibold mb-2">{item.products.name}</h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {item.products.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold">₹{item.products.price}</span>
                  <Badge variant={item.products.stock_quantity > 0 ? "default" : "destructive"}>
                    {item.products.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => moveToCart(item)}
                    disabled={item.products.stock_quantity === 0}
                    className="flex-1"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  Added {new Date(item.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};