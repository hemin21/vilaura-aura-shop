import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({ productId, className }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please log in to add items to wishlist');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsInWishlist(!isInWishlist);
      toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
      setLoading(false);
    }, 500);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleWishlist}
      disabled={loading}
      className={className}
    >
      <Heart 
        className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} 
      />
    </Button>
  );
};