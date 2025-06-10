
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, Trash2, Edit3, Save, X, Sparkles, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SavedInsight } from '@/types/databaseTypes';
import { motion, AnimatePresence } from 'framer-motion';

export const WisdomLibrary = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<SavedInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    if (user) {
      fetchSavedInsights();
    }
  }, [user]);

  const fetchSavedInsights = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching saved insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInsight = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('saved_insights')
        .delete()
        .eq('id', insightId);

      if (error) throw error;
      setInsights(prev => prev.filter(insight => insight.id !== insightId));
    } catch (error) {
      console.error('Error deleting insight:', error);
    }
  };

  const handleSaveNotes = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('saved_insights')
        .update({ user_notes: editNotes })
        .eq('id', insightId);

      if (error) throw error;
      
      setInsights(prev => prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, user_notes: editNotes }
          : insight
      ));
      
      setEditingId(null);
      setEditNotes('');
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const startEditing = (insight: SavedInsight) => {
    setEditingId(insight.id);
    setEditNotes(insight.user_notes || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditNotes('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-deep-charcoal/60">Loading your wisdom library...</div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 space-y-4"
      >
        <BookOpen className="w-12 h-12 text-gentle-sage/60 mx-auto" />
        <h3 className="text-xl font-montserrat text-deep-charcoal">
          Your wisdom library is waiting
        </h3>
        <p className="text-deep-charcoal/70 max-w-md mx-auto">
          Save meaningful insights from your conversations to build your personal collection of wisdom and reflection.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-montserrat text-deep-charcoal flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-gentle-sage" />
          Your Wisdom Library
        </h2>
        <p className="text-deep-charcoal/70">
          {insights.length} insight{insights.length !== 1 ? 's' : ''} saved for reflection
        </p>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-gentle-sage/20 hover:border-gentle-sage/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <Badge variant={insight.insight_type === 'personalized' ? 'default' : 'secondary'}>
                        {insight.insight_type === 'personalized' ? 'Personal' : 'General'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(insight)}
                        className="h-8 w-8 p-0 text-deep-charcoal/60 hover:text-deep-charcoal"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteInsight(insight.id)}
                        className="h-8 w-8 p-0 text-deep-charcoal/60 hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <blockquote className="text-deep-charcoal/90 italic leading-relaxed border-l-2 border-gentle-sage/30 pl-4">
                    "{insight.insight_text}"
                  </blockquote>
                  
                  <div className="space-y-3">
                    <div className="text-sm text-deep-charcoal/60">
                      Saved on {new Date(insight.saved_at).toLocaleDateString()}
                    </div>
                    
                    {editingId === insight.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Add your personal reflection on this insight..."
                          className="min-h-[100px] border-gentle-sage/20 focus:border-gentle-sage"
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveNotes(insight.id)}
                            className="bg-gentle-sage hover:bg-gentle-sage/90 text-white"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEditing}
                            className="text-deep-charcoal/60"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : insight.user_notes ? (
                      <div className="bg-gentle-sage/5 rounded-lg p-3 border border-gentle-sage/10">
                        <div className="text-sm font-medium text-deep-charcoal mb-1">Your reflection:</div>
                        <div className="text-deep-charcoal/80 text-sm leading-relaxed">
                          {insight.user_notes}
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(insight)}
                        className="text-gentle-sage hover:text-gentle-sage/80 text-sm"
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Add your reflection
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
