-- Create idea_groups table for organizing ideas
CREATE TABLE public.idea_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  icon TEXT DEFAULT '📁',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.idea_groups ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own groups" 
ON public.idea_groups 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own groups" 
ON public.idea_groups 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own groups" 
ON public.idea_groups 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own groups" 
ON public.idea_groups 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_idea_groups_updated_at
BEFORE UPDATE ON public.idea_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add group_id to ideas table
ALTER TABLE public.ideas 
ADD COLUMN group_id UUID REFERENCES public.idea_groups(id) ON DELETE SET NULL;