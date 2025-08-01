import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Plus, Tag as TagIcon, Upload, Link, Trash2, Crop as CropIcon, Save } from 'lucide-react';
import { Idea, IdeaStatus, IdeaColor, statusConfig, colorConfig } from '@/types/idea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface IdeaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (idea: Omit<Idea, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'image_url' | 'original_description'>) => void;
  onUpdate?: (id: string, updates: Partial<Idea>) => void;
  editingIdea?: Idea | null;
}

export const IdeaForm = ({ isOpen, onClose, onSubmit, onUpdate, editingIdea }: IdeaFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<IdeaStatus>('idea');
  const [color, setColor] = useState<IdeaColor>('gray');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isScreenshotting, setIsScreenshotting] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState<CropType>();
  const [imgRef, setImgRef] = useState<HTMLImageElement>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (editingIdea) {
      setTitle(editingIdea.title);
      setDescription(editingIdea.description);
      setStatus(editingIdea.status);
      setColor(editingIdea.color);
      setTags(editingIdea.tags);
      setImagePreview(editingIdea.image_url || null);
    } else {
      setTitle('');
      setDescription('');
      setStatus('idea');
      setColor('gray');
      setTags([]);
      setImagePreview(null);
    }
      setNewTag('');
    setImageFile(null);
    setShowCrop(false);
    setCrop(undefined);
  }, [editingIdea, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let imageUrl = imagePreview;

    // Handle image upload if there's a new file
    if (imageFile) {
      setIsUploading(true);
      try {
        const fileName = `idea-${Date.now()}-${imageFile.name}`;
        const { data, error } = await supabase.storage
          .from('idea-images')
          .upload(fileName, imageFile);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('idea-images')
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "Upload failed",
          description: "Failed to upload image. Continuing without image.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    }

    const ideaData = {
      title: title.trim(),
      description: description.trim(),
      status,
      color,
      tags,
      ...(imageUrl && { image_url: imageUrl })
    };

    if (editingIdea && onUpdate) {
      onUpdate(editingIdea.id, ideaData);
    } else {
      onSubmit(ideaData);
    }

    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file.",
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setShowCrop(true);
      
      // Initialize crop
      const img = new Image();
      img.onload = () => {
        const crop = centerCrop(
          makeAspectCrop(
            {
              unit: '%',
              width: 90,
            },
            16 / 9,
            img.width,
            img.height
          ),
          img.width,
          img.height
        );
        setCrop(crop);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setImgRef(e.currentTarget);
    
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        16 / 9,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  }, []);

  const getCroppedImage = useCallback((): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (!imgRef || !crop || !imageFile) {
        reject(new Error('Missing image or crop data'));
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No 2d context'));
        return;
      }

      const scaleX = imgRef.naturalWidth / imgRef.width;
      const scaleY = imgRef.naturalHeight / imgRef.height;

      canvas.width = crop.width! * scaleX;
      canvas.height = crop.height! * scaleY;

      ctx.drawImage(
        imgRef,
        crop.x! * scaleX,
        crop.y! * scaleY,
        crop.width! * scaleX,
        crop.height! * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const file = new File([blob], imageFile.name, { type: imageFile.type });
        resolve(file);
      }, imageFile.type);
    });
  }, [imgRef, crop, imageFile]);

  const applyCrop = async () => {
    try {
      const croppedFile = await getCroppedImage();
      setImageFile(croppedFile);
      
      // Update preview with cropped version
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(croppedFile);
      
      setShowCrop(false);
      toast({
        title: "Image cropped successfully! ✂️",
        description: "Your image has been cropped and is ready to use.",
      });
    } catch (error) {
      console.error('Error cropping image:', error);
      toast({
        title: "Crop failed",
        description: "Failed to crop image. Using original instead.",
        variant: "destructive",
      });
      setShowCrop(false);
    }
  };

  const captureScreenshot = async () => {
    const urls = description.match(/(https?:\/\/[^\s]+)/g);
    if (!urls || urls.length === 0) {
      toast({
        title: "No URL found",
        description: "Please include a valid URL in the description to capture a screenshot.",
        variant: "destructive",
      });
      return;
    }

    setIsScreenshotting(true);
    try {
      const { data, error } = await supabase.functions.invoke('capture-screenshot', {
        body: { url: urls[0] }
      });

      if (error) throw error;

      if (data?.success && data?.imageUrl) {
        setImagePreview(data.imageUrl);
        toast({
          title: "Screenshot captured! 📸",
          description: "Website screenshot has been added as your idea image.",
        });
      } else {
        throw new Error(data?.error || 'Failed to capture screenshot');
      }
    } catch (error: any) {
      console.error('Error capturing screenshot:', error);
      toast({
        title: "Screenshot failed",
        description: "Failed to capture screenshot. Please try uploading an image instead.",
        variant: "destructive",
      });
    } finally {
      setIsScreenshotting(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setShowCrop(false);
    setCrop(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editingIdea ? 'Edit Idea' : 'Add New Idea'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your app idea title..."
              className="text-base"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your idea in detail... (Include URLs for automatic screenshot capture)"
              className="min-h-[120px] text-sm leading-relaxed"
            />
          </div>

          {/* Image Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Image</Label>
            
            {showCrop && imagePreview ? (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Crop your image to the desired size:
                </div>
                <div className="relative max-h-80 overflow-hidden rounded-lg border">
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    aspect={16 / 9}
                    minWidth={100}
                    minHeight={56}
                  >
                    <img
                      ref={setImgRef}
                      src={imagePreview}
                      alt="Crop preview"
                      onLoad={onImageLoad}
                      className="max-w-full h-auto"
                    />
                  </ReactCrop>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={applyCrop}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Apply Crop
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCrop(false)}
                  >
                    Skip Crop
                  </Button>
                </div>
              </div>
            ) : imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowCrop(true)}
                  >
                    <CropIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={captureScreenshot}
                  disabled={isScreenshotting}
                  className="flex-1"
                >
                  <Link className="h-4 w-4 mr-2" />
                  {isScreenshotting ? 'Capturing...' : 'Screenshot URL'}
                </Button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">
              Upload an image (max 5MB), crop it to fit perfectly, or include a URL in the description for automatic screenshot
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={status} onValueChange={(value: IdeaStatus) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Color Theme</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(colorConfig).map(([colorKey, config]) => (
                  <button
                    key={colorKey}
                    type="button"
                    onClick={() => setColor(colorKey as IdeaColor)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${config.bg} ${config.border} ${
                      color === colorKey ? 'ring-2 ring-primary scale-110' : 'hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Add a tag..."
                className="flex-1"
              />
              <Button
                type="button"
                onClick={addTag}
                size="sm"
                variant="outline"
                className="px-3"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    <TagIcon className="h-3 w-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isUploading || isScreenshotting}>
              {isUploading ? 'Uploading...' : isScreenshotting ? 'Capturing...' : editingIdea ? 'Update Idea' : 'Add Idea'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};