import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  helpful_count: number;
  is_verified: boolean;
  user_id: string;
}

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 0, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!user) {
      toast.error('Please log in to submit a review');
      return;
    }

    if (newReview.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          product_id: productId,
          rating: newReview.rating,
          title: newReview.title,
          comment: newReview.comment
        });

      if (error) throw error;

      toast.success('Review submitted successfully');
      setNewReview({ rating: 0, title: '', comment: '' });
      fetchReviews(); // Refresh reviews
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const markHelpful = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ helpful_count: reviews.find(r => r.id === reviewId)?.helpful_count + 1 })
        .eq('id', reviewId);

      if (error) throw error;

      // Update local state
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId 
            ? { ...review, helpful_count: review.helpful_count + 1 }
            : review
        )
      );

      toast.success('Marked as helpful');
    } catch (error) {
      console.error('Error marking helpful:', error);
      toast.error('Failed to mark as helpful');
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRatingChange?.(star)}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
        {renderStars(Math.round(averageRating))}
        <span className="text-muted-foreground">({reviews.length} reviews)</span>
      </div>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rating</label>
              {renderStars(newReview.rating, true, (rating) => 
                setNewReview(prev => ({ ...prev, rating }))
              )}
            </div>
            <Input
              placeholder="Review title (optional)"
              value={newReview.title}
              onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
            />
            <Textarea
              placeholder="Share your experience with this product..."
              value={newReview.comment}
              onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
            />
            <Button onClick={submitReview} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No reviews yet. Be the first to review this product!
          </div>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">User</span>
                      {review.is_verified && (
                        <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
                      )}
                    </div>
                    {renderStars(review.rating)}
                    {review.title && (
                      <h4 className="font-medium">{review.title}</h4>
                    )}
                    <p className="text-muted-foreground">{review.comment}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{new Date(review.created_at).toLocaleDateString()}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markHelpful(review.id)}
                        className="h-auto p-0"
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Helpful ({review.helpful_count})
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};