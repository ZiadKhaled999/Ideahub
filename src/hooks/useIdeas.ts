import { useState, useCallback } from 'react';
import { Idea, IdeaStatus, IdeaColor } from '@/types/idea';

// Mock data for demonstration
const mockIdeas: Idea[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'AI-Powered Recipe Finder',
    description: 'An app that suggests recipes based on ingredients you have at home using AI image recognition',
    status: 'idea',
    tags: ['AI', 'Food', 'Mobile'],
    color: 'yellow',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    userId: 'user1',
    title: 'Personal Finance Tracker',
    description: 'A beautiful, privacy-focused finance app that categorizes expenses automatically and provides insights without connecting to banks',
    status: 'research',
    tags: ['Finance', 'Privacy', 'SaaS'],
    color: 'green',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '3',
    userId: 'user1',
    title: 'Habit Builder Game',
    description: 'Gamify habit building with RPG elements - level up your character by completing real-world habits and goals',
    status: 'progress',
    tags: ['Gaming', 'Productivity', 'Mobile'],
    color: 'purple',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '4',
    userId: 'user1',
    title: 'Local Event Discovery',
    description: 'Help people discover cool local events, workshops, and meetups happening in their neighborhood',
    status: 'launched',
    tags: ['Social', 'Local', 'Web'],
    color: 'blue',
    createdAt: new Date('2023-12-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '5',
    userId: 'user1',
    title: 'Voice Note Organizer',
    description: 'An app that transcribes voice notes, automatically categorizes them, and makes them searchable',
    status: 'idea',
    tags: ['AI', 'Productivity', 'Voice'],
    color: 'pink',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  }
];

export const useIdeas = () => {
  const [ideas, setIdeas] = useState<Idea[]>(mockIdeas);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | 'all'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || idea.status === statusFilter;
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => idea.tags.includes(tag));
    
    return matchesSearch && matchesStatus && matchesTags;
  });

  const addIdea = useCallback((newIdea: Omit<Idea, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const idea: Idea = {
      ...newIdea,
      id: Math.random().toString(36).substr(2, 9),
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setIdeas(prev => [idea, ...prev]);
  }, []);

  const updateIdea = useCallback((id: string, updates: Partial<Idea>) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === id 
        ? { ...idea, ...updates, updatedAt: new Date() }
        : idea
    ));
  }, []);

  const deleteIdea = useCallback((id: string) => {
    setIdeas(prev => prev.filter(idea => idea.id !== id));
  }, []);

  const allTags = Array.from(new Set(ideas.flatMap(idea => idea.tags))).sort();

  return {
    ideas: filteredIdeas,
    allIdeas: ideas,
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
  };
};