import { useState } from 'react';
import { IdeaGroup } from '@/types/group';
import { Idea } from '@/types/idea';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PremiumIdeaCard } from '@/components/ideas/PremiumIdeaCard';
import { ChevronDown, ChevronRight, Plus, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GroupCardProps {
  group: IdeaGroup;
  ideas: Idea[];
  onEditGroup: (group: IdeaGroup) => void;
  onDeleteGroup: (id: string) => void;
  onEditIdea: (idea: Idea) => void;
  onDeleteIdea: (id: string) => void;
  onPreviewIdea: (idea: Idea) => void;
  onAddIdeaToGroup: (groupId: string) => void;
  settings: any;
}

export const GroupCard = ({
  group,
  ideas,
  onEditGroup,
  onDeleteGroup,
  onEditIdea,
  onDeleteIdea,
  onPreviewIdea,
  onAddIdeaToGroup,
  settings
}: GroupCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-500 ease-out",
      "hover:shadow-xl hover:-translate-y-1",
      "animate-scale-in border-2 border-transparent hover:border-primary/20"
    )}>
      {/* Group Header */}
      <div 
        className="p-6 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300",
                "group-hover:scale-110 group-hover:rotate-3"
              )}
              style={{ backgroundColor: `${group.color}20`, color: group.color }}
            >
              {group.icon}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {group.name}
                </h3>
                <Badge variant="secondary" className="animate-pulse">
                  {ideas.length}
                </Badge>
              </div>
              {group.description && (
                <p className="text-sm text-muted-foreground mt-1 break-words">
                  {group.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onAddIdeaToGroup(group.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEditGroup(group);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteGroup(group.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className={cn(
              "transition-transform duration-300",
              isExpanded ? "rotate-90" : ""
            )}>
              {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </div>
          </div>
        </div>
      </div>

      {/* Ideas Grid - Expandable */}
      <div className={cn(
        "overflow-hidden transition-all duration-500 ease-out",
        isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-6 pb-6">
          <div className="border-t border-border/50 pt-4">
            {ideas.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No ideas in this group yet</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAddIdeaToGroup(group.id)}
                  className="mt-3"
                >
                  Add First Idea
                </Button>
              </div>
            ) : (
              <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                {ideas.map((idea, index) => (
                  <div
                    key={idea.id}
                    className="animate-slide-up break-inside-avoid"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <PremiumIdeaCard
                      idea={idea}
                      onEdit={onEditIdea}
                      onDelete={onDeleteIdea}
                      onPreview={onPreviewIdea}
                      settings={settings}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};