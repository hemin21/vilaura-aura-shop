import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({ productId, className }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkWishlistStatus();
    }
  }, [user, productId]);

  const checkWishlistStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking wishlist status:', error);
        return;
      }

      setIsInWishlist(!!data);
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const toggleWishlist = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!user) {
      toast.error('Please log in to add items to wishlist');
      return;
    }

    setLoading(true);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;

        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlists')
          .insert({
            user_id: user.id,
            product_id: productId
          });

        if (error) throw error;

        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setLoading(false);
    }
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