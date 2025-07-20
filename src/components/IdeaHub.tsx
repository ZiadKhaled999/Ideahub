import { useState } from 'react';
import { Plus, Lightbulb, Brain, Rocket } from 'lucide-react';
import { useIdeas } from '@/hooks/useIdeas';
import { Idea } from '@/types/idea';
import { Button } from '@/components/ui/button';
import { IdeaForm } from './IdeaForm';
import { IdeaGrid } from './IdeaGrid';
import { SearchAndFilters } from './SearchAndFilters';
import { UserProfile } from './UserProfile';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const IdeaHub = () => {
  const { profile } = useAuth();
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
  const { toast } = useToast();

  const handleAddIdea = (newIdea: Omit<Idea, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    addIdea(newIdea);
    toast({
      title: "Idea added! 💡",
      description: "Your new idea has been saved to the hub.",
    });
  };

  const handleUpdateIdea = (id: string, updates: Partial<Idea>) => {
    updateIdea(id, updates);
    setEditingIdea(null);
    toast({
      title: "Idea updated! ✨",
      description: "Your changes have been saved.",
    });
  };

  const handleDeleteIdea = (id: string) => {
    deleteIdea(id);
    toast({
      title: "Idea deleted",
      description: "The idea has been removed from your hub.",
      variant: "destructive",
    });
  };

  const handleEditIdea = (idea: Idea) => {
    setEditingIdea(idea);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingIdea(null);
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Idea Hub</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {profile?.display_name || 'Creative Thinker'}!
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300 h-11 px-6"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Idea
              </Button>
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {allIdeas.filter(i => i.status === 'idea').length}
                </p>
                <p className="text-xs text-muted-foreground">Ideas</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Brain className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {allIdeas.filter(i => i.status === 'research').length}
                </p>
                <p className="text-xs text-muted-foreground">Research</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Plus className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {allIdeas.filter(i => i.status === 'progress').length}
                </p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <Rocket className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {allIdeas.filter(i => i.status === 'launched').length}
                </p>
                <p className="text-xs text-muted-foreground">Launched</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
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

        {/* Ideas Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center animate-pulse">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <p className="text-muted-foreground">Loading your brilliant ideas...</p>
          </div>
        ) : (
          <IdeaGrid
            ideas={ideas}
            onEditIdea={handleEditIdea}
            onDeleteIdea={handleDeleteIdea}
          />
        )}
      </main>

      {/* Idea Form Modal */}
      <IdeaForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleAddIdea}
        onUpdate={handleUpdateIdea}
        editingIdea={editingIdea}
      />
    </div>
  );
};