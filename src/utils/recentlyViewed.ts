import { supabase } from '@/integrations/supabase/client';

export const addToRecentlyViewed = async (userId: string, productId: string) => {
  try {
    // First check if the product is already in recently viewed
    const { data: existing } = await supabase
      .from('recently_viewed')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      // Update the viewed_at timestamp
      const { error } = await supabase
        .from('recently_viewed')
        .update({ viewed_at: new Date().toISOString() })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Insert new record
      const { error } = await supabase
        .from('recently_viewed')
        .insert({
          user_id: userId,
          product_id: productId,
          viewed_at: new Date().toISOString()
        });

      if (error) throw error;
    }

    // Keep only the latest 10 recently viewed items per user
    const { data: allRecent } = await supabase
      .from('recently_viewed')
      .select('id')
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false });

    if (allRecent && allRecent.length > 10) {
      const idsToDelete = allRecent.slice(10).map(item => item.id);
      
      const { error } = await supabase
        .from('recently_viewed')
        .delete()
        .in('id', idsToDelete);

      if (error) throw error;
    }

  } catch (error) {
    console.error('Error adding to recently viewed:', error);
  }
};

export const getRecentlyViewed = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('recently_viewed')
      .select(`
        *,
        products (
          id,
          name,
          price,
          image_url,
          description
        )
      `)
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching recently viewed:', error);
    return [];
  }
};
