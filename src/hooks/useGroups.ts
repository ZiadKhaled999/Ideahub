import { useState, useEffect } from 'react';
import { IdeaGroup } from '@/types/group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useGroups = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<IdeaGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Load groups
  const loadGroups = async () => {
    if (!user) {
      setGroups([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('idea_groups')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast({
        title: "Error loading groups",
        description: "Failed to load your idea groups.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add group
  const addGroup = async (groupData: Omit<IdeaGroup, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('idea_groups')
        .insert([{
          ...groupData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setGroups(prev => [data, ...prev]);
      toast({
        title: "Group created! 🎉",
        description: `"${groupData.name}" group has been created.`,
      });

      return data;
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error creating group",
        description: "Failed to create the group. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update group
  const updateGroup = async (id: string, updates: Partial<IdeaGroup>) => {
    try {
      const { data, error } = await supabase
        .from('idea_groups')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setGroups(prev => prev.map(group => 
        group.id === id ? { ...group, ...data } : group
      ));

      toast({
        title: "Group updated",
        description: "Your group has been updated successfully.",
      });

      return data;
    } catch (error) {
      console.error('Error updating group:', error);
      toast({
        title: "Error updating group",
        description: "Failed to update the group. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Delete group
  const deleteGroup = async (id: string) => {
    try {
      const { error } = await supabase
        .from('idea_groups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGroups(prev => prev.filter(group => group.id !== id));
      toast({
        title: "Group deleted",
        description: "The group has been removed.",
      });
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "Error deleting group",
        description: "Failed to delete the group. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadGroups();
  }, [user]);

  return {
    groups,
    loading,
    addGroup,
    updateGroup,
    deleteGroup,
    loadGroups
  };
};