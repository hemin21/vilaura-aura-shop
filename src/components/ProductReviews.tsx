import React, { useState } from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  // Mock data for now - will be replaced when database is ready
  const reviews = [
    {
      id: '1',
      rating: 5,
      comment: 'Excellent product! Really loved the quality and fragrance.',
      created_at: '2024-01-15',
      helpful_count: 12,
      verified_purchase: true,
      profiles: { first_name: 'Sarah', last_name: 'J.' }
    },
    {
      id: '2',
      rating: 4,
      comment: 'Good soap, nice natural ingredients. Will buy again!',
      created_at: '2024-01-10',
      helpful_count: 8,
      verified_purchase: true,
      profiles: { first_name: 'Michael', last_name: 'R.' }
    }
  ];

  const submitReview = async () => {
    if (!user) {
      toast.error('Please log in to submit a review');
      return;
    }

    if (newReview.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      toast.success('Review will be submitted once the database is ready');
      setNewReview({ rating: 0, comment: '' });
      setSubmitting(false);
    }, 1000);
  };

  const markHelpful = async (reviewId: string) => {
    toast.info('Feature will be available once database is ready');
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
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback>
                    {review.profiles?.first_name?.[0]}{review.profiles?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {review.profiles?.first_name} {review.profiles?.last_name}
                    </span>
                    {review.verified_purchase && (
                      <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
                    )}
                  </div>
                  {renderStars(review.rating)}
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
        ))}
      </div>
    </div>
  );
};