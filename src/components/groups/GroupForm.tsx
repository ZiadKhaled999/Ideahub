import { useState, useEffect } from 'react';
import { IdeaGroup } from '@/types/group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const groupColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

const groupIcons = [
  '📁', '🎯', '💡', '🚀', '⭐', '🎨', '🔧', '📱',
  '💻', '🌟', '🔥', '⚡', '🎪', '🎭', '🎨', '🎯'
];

interface GroupFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (group: Omit<IdeaGroup, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onUpdate?: (id: string, updates: Partial<IdeaGroup>) => void;
  editingGroup?: IdeaGroup | null;
}

export const GroupForm = ({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  editingGroup
}: GroupFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(groupColors[0]);
  const [selectedIcon, setSelectedIcon] = useState(groupIcons[0]);

  useEffect(() => {
    if (editingGroup) {
      setName(editingGroup.name);
      setDescription(editingGroup.description || '');
      setSelectedColor(editingGroup.color);
      setSelectedIcon(editingGroup.icon);
    } else {
      setName('');
      setDescription('');
      setSelectedColor(groupColors[0]);
      setSelectedIcon(groupIcons[0]);
    }
  }, [editingGroup, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    const groupData = {
      name: name.trim(),
      description: description.trim(),
      color: selectedColor,
      icon: selectedIcon
    };

    if (editingGroup && onUpdate) {
      onUpdate(editingGroup.id, groupData);
    } else {
      onSubmit(groupData);
    }

    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setSelectedColor(groupColors[0]);
    setSelectedIcon(groupIcons[0]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-text bg-clip-text text-transparent">
            {editingGroup ? 'Edit Group' : 'Create New Group'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preview */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-subtle border">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110"
              style={{ backgroundColor: `${selectedColor}20`, color: selectedColor }}
            >
              {selectedIcon}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {name || 'Group Name'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {description || 'Group description...'}
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name..."
              className="transition-all duration-200 focus:scale-[1.02]"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="groupDescription">Description (Optional)</Label>
            <Textarea
              id="groupDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this group..."
              className="transition-all duration-200 focus:scale-[1.02] resize-none"
              rows={3}
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-8 gap-2">
              {groupIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all duration-200 hover:scale-110 ${
                    selectedIcon === icon 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-8 gap-2">
              {groupColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-lg transition-all duration-200 hover:scale-110 ${
                    selectedColor === color 
                      ? 'ring-2 ring-primary ring-offset-2' 
                      : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 shadow-elegant"
              disabled={!name.trim()}
            >
              {editingGroup ? 'Update Group' : 'Create Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};