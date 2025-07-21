import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit3, Calendar, Tag, Sparkles, Undo2, ImageIcon } from 'lucide-react';
import { Idea, statusConfig, colorConfig } from '@/types/idea';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface IdeaPreviewModalProps {
  idea: Idea | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (idea: Idea) => void;
  settings: {
    auto_image_generation: boolean;
    ai_description_enhancement: boolean;
    markdown_preview: boolean;
    developer_mode: boolean;
  };
}

export const IdeaPreviewModal = ({ 
  idea, 
  isOpen, 
  onClose, 
  onEdit, 
  settings 
}: IdeaPreviewModalProps) => {
  const [isEnhancingDescription, setIsEnhancingDescription] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { toast } = useToast();

  if (!idea) return null;

  const colorStyle = colorConfig[idea.color];
  const statusStyle = statusConfig[idea.status];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
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
        
        // Refresh the modal data
        window.location.reload();
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
      
      // Refresh the modal data
      window.location.reload();
    } catch (error) {
      console.error('Error undoing enhancement:', error);
      toast({
        title: "Undo failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

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
        const { error: updateError } = await supabase
          .from('ideas')
          .update({ image_url: data.imageUrl })
          .eq('id', idea.id);

        if (updateError) throw updateError;

        toast({
          title: "Image generated! 🎨",
          description: "A beautiful image has been created for your idea.",
        });
        
        // Refresh the modal data
        window.location.reload();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{idea.title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={`${statusStyle.color} border-0`}
              >
                {statusStyle.label}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(idea)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          {idea.image_url ? (
            <div className="relative rounded-lg overflow-hidden">
              <img 
                src={idea.image_url} 
                alt={idea.title}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          ) : settings.auto_image_generation && (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No image generated yet</p>
              <Button 
                onClick={generateImage}
                disabled={isGeneratingImage}
                variant="outline"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                {isGeneratingImage ? 'Generating...' : 'Generate Image'}
              </Button>
            </div>
          )}

          {/* Description */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Description</h3>
              <div className="flex items-center gap-2">
                {idea.original_description && (
                  <Badge variant="secondary">Enhanced</Badge>
                )}
                {settings.ai_description_enhancement && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={enhanceDescription}
                      disabled={isEnhancingDescription}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {isEnhancingDescription ? 'Enhancing...' : 'Enhance with AI'}
                    </Button>
                    {idea.original_description && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={undoEnhancement}
                      >
                        <Undo2 className="h-4 w-4 mr-2" />
                        Undo
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="prose prose-gray max-w-none dark:prose-invert">
              {settings.markdown_preview ? (
                <ReactMarkdown>{idea.description}</ReactMarkdown>
              ) : (
                <p className="whitespace-pre-wrap">{idea.description}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Tags */}
          {idea.tags.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {idea.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="outline"
                    className="bg-muted/50"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Created: {formatDate(idea.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Updated: {formatDate(idea.updatedAt)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};