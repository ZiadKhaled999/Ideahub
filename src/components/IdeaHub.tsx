import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Grid3x3, List, Search } from 'lucide-react';
import { useIdeas } from '@/hooks/useIdeas';
import { UserProfile } from '@/components/UserProfile';
import { IdeaForm } from '@/components/IdeaForm';
import { SearchAndFilters } from '@/components/SearchAndFilters';
import { PremiumIdeaCard } from '@/components/ideas/PremiumIdeaCard';
import { IdeaPreviewModal } from '@/components/ideas/IdeaPreviewModal';
import { GroupCard } from '@/components/groups/GroupCard';
import { GroupForm } from '@/components/groups/GroupForm';
import { useGroups } from '@/hooks/useGroups';
import { Idea } from '@/types/idea';
import { IdeaGroup } from '@/types/group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserSettings {
  auto_image_generation: boolean;
  ai_description_enhancement: boolean;
  markdown_preview: boolean;
  developer_mode: boolean;
  theme: string;
}

export const IdeaHub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    ideas,
    allIdeas,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedTags,
    setSelectedTags,
    allTags,
    addIdea,
    updateIdea,
    deleteIdea
  } = useIdeas();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [previewIdea, setPreviewIdea] = useState<Idea | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'groups'>('groups');
  const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<IdeaGroup | null>(null);
  const [selectedGroupForIdea, setSelectedGroupForIdea] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    auto_image_generation: false,
    ai_description_enhancement: false,
    markdown_preview: true,
    developer_mode: false,
    theme: 'system'
  });

  const {
    groups,
    loading: groupsLoading,
    addGroup,
    updateGroup,
    deleteGroup
  } = useGroups();

  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          const loadedSettings = {
            auto_image_generation: data.auto_image_generation,
            ai_description_enhancement: data.ai_description_enhancement,
            markdown_preview: data.markdown_preview,
            developer_mode: data.developer_mode,
            theme: data.theme
          };
          setSettings(loadedSettings);
          
          // Apply theme on load
          const root = window.document.documentElement;
          root.classList.remove('light', 'dark');
          
          if (loadedSettings.theme === 'light') {
            root.classList.add('light');
          } else if (loadedSettings.theme === 'dark') {
            root.classList.add('dark');
          } else {
            // System theme - detect and apply
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, [user]);

  const handleAddIdea = async (newIdea: Omit<Idea, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'image_url' | 'original_description'>) => {
    const ideaWithGroup = {
      ...newIdea,
      group_id: selectedGroupForIdea
    };
    
    await addIdea(ideaWithGroup);
    setIsFormOpen(false);
    setSelectedGroupForIdea(null);
    
    toast({
      title: "Idea created! 🎉",
      description: settings.auto_image_generation ? 
        "AI image generation will start shortly." : 
        "Your idea has been saved successfully.",
    });
  };

  const handleEditIdea = async (id: string, updates: Partial<Idea>) => {
    await updateIdea(id, updates);
    setEditingIdea(null);
  };

  const handleDeleteIdea = async (id: string) => {
    await deleteIdea(id);
    toast({
      title: "Idea deleted",
      description: "Your idea has been removed.",
    });
  };

  const openEditForm = (idea: Idea) => {
    setEditingIdea(idea);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingIdea(null);
  };

  const openPreview = (idea: Idea) => {
    setPreviewIdea(idea);
  };

  const closePreview = () => {
    setPreviewIdea(null);
  };

  const handleAddGroup = async (groupData: Omit<IdeaGroup, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await addGroup(groupData);
    setIsGroupFormOpen(false);
  };

  const handleEditGroup = async (id: string, updates: Partial<IdeaGroup>) => {
    await updateGroup(id, updates);
    setEditingGroup(null);
    setIsGroupFormOpen(false);
  };

  const openEditGroupForm = (group: IdeaGroup) => {
    setEditingGroup(group);
    setIsGroupFormOpen(true);
  };

  const closeGroupForm = () => {
    setIsGroupFormOpen(false);
    setEditingGroup(null);
  };

  const handleAddIdeaToGroup = (groupId: string) => {
    setSelectedGroupForIdea(groupId);
    setIsFormOpen(true);
  };

  // Group ideas by group_id
  const groupedIdeas = ideas.reduce((acc, idea) => {
    const key = idea.group_id || 'ungrouped';
    if (!acc[key]) acc[key] = [];
    acc[key].push(idea);
    return acc;
  }, {} as Record<string, Idea[]>);

  const ungroupedIdeas = groupedIdeas['ungrouped'] || [];

  if (loading || groupsLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center animate-pulse">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground">Loading your ideas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-card-header/95 backdrop-blur supports-[backdrop-filter]:bg-card-header/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-text bg-clip-text text-transparent">
                Idea Hub
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'groups' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('groups')}
                  className="hidden sm:flex"
                >
                  📁
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="hidden sm:flex"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="hidden sm:flex"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                {viewMode === 'groups' && (
                  <Button 
                    onClick={() => setIsGroupFormOpen(true)} 
                    variant="outline"
                    className="shadow-elegant"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Group
                  </Button>
                )}
                <Button onClick={() => setIsFormOpen(true)} className="shadow-elegant">
                  <Plus className="h-4 w-4 mr-2" />
                  New Idea
                </Button>
              </div>
              
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SearchAndFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          allTags={allTags}
          totalCount={allIdeas.length}
          filteredCount={ideas.length}
        />
      </div>

      {/* Ideas Grid/List/Groups */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {viewMode === 'groups' ? (
          <div className="space-y-6">
            {/* Groups */}
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                ideas={groupedIdeas[group.id] || []}
                onEditGroup={openEditGroupForm}
                onDeleteGroup={deleteGroup}
                onEditIdea={openEditForm}
                onDeleteIdea={handleDeleteIdea}
                onPreviewIdea={openPreview}
                onAddIdeaToGroup={handleAddIdeaToGroup}
                settings={settings}
              />
            ))}
            
            {/* Ungrouped Ideas */}
            {ungroupedIdeas.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    📝
                  </div>
                  Ungrouped Ideas
                  <span className="text-sm text-muted-foreground">({ungroupedIdeas.length})</span>
                </h2>
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                  {ungroupedIdeas.map((idea, index) => (
                    <div
                      key={idea.id}
                      className="animate-bounce-in break-inside-avoid"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <PremiumIdeaCard
                        idea={idea}
                        onEdit={openEditForm}
                        onDelete={handleDeleteIdea}
                        onPreview={openPreview}
                        settings={settings}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State for Groups */}
            {groups.length === 0 && ungroupedIdeas.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-primary/10 flex items-center justify-center animate-pulse-glow">
                  <Plus className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Create Your First Group
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Organize your ideas into groups like your favorite apps. Start by creating a group!
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setIsGroupFormOpen(true)} className="shadow-elegant animate-wiggle">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Group
                  </Button>
                  <Button onClick={() => setIsFormOpen(true)} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Idea
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-primary/10 flex items-center justify-center">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              {searchQuery || statusFilter !== 'all' || selectedTags.length > 0 
                ? 'No ideas match your filters' 
                : 'No ideas yet'
              }
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'all' || selectedTags.length > 0
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Start capturing your brilliant app ideas and organize them like never before.'
              }
            </p>
            <Button onClick={() => setIsFormOpen(true)} className="shadow-elegant">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Idea
            </Button>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4' 
              : 'space-y-4 max-w-4xl mx-auto'
          }`}>
            {ideas.map((idea, index) => (
              <div
                key={idea.id}
                className="animate-bounce-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PremiumIdeaCard
                  idea={idea}
                  onEdit={openEditForm}
                  onDelete={handleDeleteIdea}
                  onPreview={openPreview}
                  settings={settings}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <IdeaForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleAddIdea}
        onUpdate={editingIdea ? 
          (id, updates) => handleEditIdea(id, updates) : 
          undefined
        }
        editingIdea={editingIdea}
      />

      {previewIdea && (
        <IdeaPreviewModal
          idea={previewIdea}
          isOpen={!!previewIdea}
          onClose={closePreview}
          onEdit={openEditForm}
          settings={settings}
        />
      )}

      <GroupForm
        isOpen={isGroupFormOpen}
        onClose={closeGroupForm}
        onSubmit={handleAddGroup}
        onUpdate={editingGroup ? 
          (id, updates) => handleEditGroup(id, updates) : 
          undefined
        }
        editingGroup={editingGroup}
      />
    </div>
  );
};