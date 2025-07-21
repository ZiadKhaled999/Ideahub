import { useState, useRef, useEffect } from 'react';
import { Edit3, Trash2, Calendar, Tag, MoreHorizontal, ImageIcon, Sparkles, Undo2 } from 'lucide-react';
import { Idea, statusConfig, colorConfig } from '@/types/idea';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

interface PremiumIdeaCardProps {
  idea: Idea;
  onEdit: (idea: Idea) => void;
  onDelete: (id: string) => void;
  onPreview: (idea: Idea) => void;
  settings: {
    auto_image_generation: boolean;
    ai_description_enhancement: boolean;
    markdown_preview: boolean;
    developer_mode: boolean;
  };
}

export const PremiumIdeaCard = ({ 
  idea, 
  onEdit, 
  onDelete, 
  onPreview, 
  settings 
}: PremiumIdeaCardProps) => {
  const [isLongPressed, setIsLongPressed] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isEnhancingDescription, setIsEnhancingDescription] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const colorStyle = colorConfig[idea.color];
  const statusStyle = statusConfig[idea.status];
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleMouseDown = () => {
    longPressTimer.current = setTimeout(() => {
      setIsLongPressed(true);
    }, 500);
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    if (!isLongPressed) {
      onPreview(idea);
    }
    setTimeout(() => setIsLongPressed(false), 100);
  };

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setIsLongPressed(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    if (!isLongPressed) {
      onPreview(idea);
    }
    setTimeout(() => setIsLongPressed(false), 100);
  };

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  const generateImage = async () => {
    if (!settings.auto_image_generation) return;
    
    setIsGeneratingImage(true);
    try {
      const apiKey = settings.developer_mode ? sessionStorage.getItem('dev_google_ai_key') : null;
      
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          prompt: `Create a beautiful, professional illustration for an app idea: ${idea.title}. ${idea.description.substring(0, 200)}`,
          apiKey
        }
      });

      if (error) throw error;

      if (data.success) {
        // Update the idea with the generated image
        const { error: updateError } = await supabase
          .from('ideas')
          .update({ image_url: data.imageUrl })
          .eq('id', idea.id);

        if (updateError) throw updateError;

        toast({
          title: "Image generated! 🎨",
          description: "A beautiful image has been created for your idea.",
        });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Image generation failed",
        description: "Please try again or check your API configuration.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const enhanceDescription = async () => {
    if (!settings.ai_description_enhancement) return;
    
    setIsEnhancingDescription(true);
    try {
      const apiKey = settings.developer_mode ? sessionStorage.getItem('dev_deepseek_key') : null;
      
      const { data, error } = await supabase.functions.invoke('enhance-description', {
        body: { 
          title: idea.title,
          description: idea.description,
          apiKey
        }
      });

      if (error) throw error;

      if (data.success) {
        // Store original description and update with enhanced one
        const { error: updateError } = await supabase
          .from('ideas')
          .update({ 
            original_description: idea.original_description || idea.description,
            description: data.enhancedDescription 
          })
          .eq('id', idea.id);

        if (updateError) throw updateError;

        toast({
          title: "Description enhanced! ✨",
          description: "Your idea description has been improved with AI insights.",
        });
      }
    } catch (error) {
      console.error('Error enhancing description:', error);
      toast({
        title: "Enhancement failed",
        description: "Please try again or check your API configuration.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancingDescription(false);
    }
  };

  const undoEnhancement = async () => {
    if (!idea.original_description) return;
    
    try {
      const { error } = await supabase
        .from('ideas')
        .update({ 
          description: idea.original_description,
          original_description: null
        })
        .eq('id', idea.id);

      if (error) throw error;

      toast({
        title: "Description restored",
        description: "Your original description has been restored.",
      });
    } catch (error) {
      console.error('Error undoing enhancement:', error);
      toast({
        title: "Undo failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card 
      className={`group relative break-inside-avoid mb-4 cursor-pointer transition-all duration-300 hover:shadow-float hover:-translate-y-1 ${colorStyle.bg} ${colorStyle.border} border-2 overflow-hidden`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image Banner */}
      {idea.image_url && (
        <div className="relative h-32 w-full overflow-hidden">
          <img 
            src={idea.image_url} 
            alt={idea.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <div className="p-4">
        {/* Status Badge and Actions */}
        <div className="flex items-center justify-between mb-3">
          <Badge 
            variant="secondary" 
            className={`text-xs font-medium ${statusStyle.color} border-0`}
          >
            {statusStyle.label}
          </Badge>
          
          {/* Long Press Menu */}
          {isLongPressed && (
            <div className="flex gap-1 animate-scale-in">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-white/50"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(idea);
                }}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(idea.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* AI Actions Dropdown */}
          {(settings.auto_image_generation || settings.ai_description_enhancement) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                {settings.auto_image_generation && (
                  <DropdownMenuItem 
                    onClick={generateImage}
                    disabled={isGeneratingImage}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {isGeneratingImage ? 'Generating...' : 'Generate Image'}
                  </DropdownMenuItem>
                )}
                {settings.ai_description_enhancement && (
                  <>
                    <DropdownMenuItem 
                      onClick={enhanceDescription}
                      disabled={isEnhancingDescription}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {isEnhancingDescription ? 'Enhancing...' : 'Enhance Description'}
                    </DropdownMenuItem>
                    {idea.original_description && (
                      <DropdownMenuItem onClick={undoEnhancement}>
                        <Undo2 className="h-4 w-4 mr-2" />
                        Undo Enhancement
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground mb-2 leading-tight">
          {idea.title}
        </h3>

        {/* Description Preview */}
        <div className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {settings.markdown_preview ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>
                {truncateDescription(idea.description)}
              </ReactMarkdown>
            </div>
          ) : (
            <p>{truncateDescription(idea.description)}</p>
          )}
        </div>

        {/* Tags */}
        {idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {idea.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs bg-white/50 border-white/60 hover:bg-white/70"
              >
                <Tag className="h-2.5 w-2.5 mr-1" />
                {tag}
              </Badge>
            ))}
            {idea.tags.length > 3 && (
              <Badge variant="outline" className="text-xs bg-white/50 border-white/60">
                +{idea.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Created Date */}
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          {formatDate(idea.createdAt)}
          {idea.original_description && (
            <Badge variant="secondary" className="ml-2 text-xs">
              Enhanced
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};