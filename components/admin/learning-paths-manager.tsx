"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, GripVertical, Code, Palette, Database, Server } from "lucide-react";
import {
  useLearningPaths,
  usePathCategories,
  useCreateLearningPath,
  useUpdateLearningPath,
  useDeleteLearningPath
} from "@/hooks/use-admin-data";

interface PathCategory {
  id: string;
  name: string;
  slug: string;
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  slug: string;
  category_id: string;
  difficulty_level: string;
  icon_name: string;
  color_scheme: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: PathCategory;
}

interface LearningPathsManagerProps {
  onStatsUpdate: () => void;
}

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" }
];

const ICON_OPTIONS = [
  { value: "Code", label: "Code", icon: Code },
  { value: "Palette", label: "Palette", icon: Palette },
  { value: "Database", label: "Database", icon: Database },
  { value: "Server", label: "Server", icon: Server }
];

const COLOR_SCHEMES = [
  { value: "from-blue-600 to-indigo-600", label: "Blue to Indigo" },
  { value: "from-purple-600 to-pink-600", label: "Purple to Pink" },
  { value: "from-green-600 to-teal-600", label: "Green to Teal" },
  { value: "from-orange-600 to-red-600", label: "Orange to Red" },
  { value: "from-gray-600 to-slate-600", label: "Gray to Slate" }
];

export function LearningPathsManager({ onStatsUpdate }: LearningPathsManagerProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    category_id: "",
    difficulty_level: "beginner",
    icon_name: "Code",
    color_scheme: "from-blue-600 to-indigo-600",
    order_index: 0,
    is_active: true
  });

  // React Query hooks
  const { data: paths = [], isLoading: pathsLoading, error: pathsError } = useLearningPaths();
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = usePathCategories();
  const createPathMutation = useCreateLearningPath();
  const updatePathMutation = useUpdateLearningPath();
  const deletePathMutation = useDeleteLearningPath();

  const loading = pathsLoading || categoriesLoading;

  // Handle query errors
  if (pathsError) {
    console.error('Error loading learning paths:', pathsError);
    toast({
      title: "Error",
      description: "Failed to load learning paths",
      variant: "destructive",
    });
  }

  if (categoriesError) {
    console.error('Error loading categories:', categoriesError);
    toast({
      title: "Error",
      description: "Failed to load categories",
      variant: "destructive",
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPath) {
        // Update existing path
        await updatePathMutation.mutateAsync({
          id: editingPath.id,
          name: formData.name,
          description: formData.description,
          slug: formData.slug,
          category_id: formData.category_id,
          difficulty_level: formData.difficulty_level,
          icon_name: formData.icon_name,
          color_scheme: formData.color_scheme,
          order_index: formData.order_index,
          is_active: formData.is_active
        });

        toast({
          title: "Success",
          description: "Learning path updated successfully",
        });
      } else {
        // Create new path
        await createPathMutation.mutateAsync({
          name: formData.name,
          description: formData.description,
          slug: formData.slug,
          category_id: formData.category_id,
          difficulty_level: formData.difficulty_level,
          icon_name: formData.icon_name,
          color_scheme: formData.color_scheme,
          order_index: formData.order_index,
          is_active: formData.is_active
        });

        toast({
          title: "Success",
          description: "Learning path created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingPath(null);
      resetForm();
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error saving learning path:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save learning path",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      slug: "",
      category_id: "",
      difficulty_level: "beginner",
      icon_name: "Code",
      color_scheme: "from-blue-600 to-indigo-600",
      order_index: 0,
      is_active: true
    });
  };

  const handleEdit = (path: LearningPath) => {
    setEditingPath(path);
    setFormData({
      name: path.name,
      description: path.description,
      slug: path.slug,
      category_id: path.category_id,
      difficulty_level: path.difficulty_level,
      icon_name: path.icon_name,
      color_scheme: path.color_scheme,
      order_index: path.order_index,
      is_active: path.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (pathId: string) => {
    if (!confirm("Are you sure you want to delete this learning path? This will also delete all associated challenges.")) {
      return;
    }

    try {
      await deletePathMutation.mutateAsync(pathId);

      toast({
        title: "Success",
        description: "Learning path deleted successfully",
      });
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error deleting learning path:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete learning path",
        variant: "destructive",
      });
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name)
    }));
  };

  if (loading) {
    return <Loading text="Loading learning paths..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Learning Paths</h3>
          <p className="text-sm text-gray-600">
            Create and manage learning paths for different technologies
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingPath(null);
              resetForm();
              setFormData(prev => ({ ...prev, order_index: paths.length }));
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Learning Path
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingPath ? "Edit Learning Path" : "Create New Learning Path"}
              </DialogTitle>
              <DialogDescription>
                {editingPath
                  ? "Update the learning path details below."
                  : "Add a new learning path for users to follow."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., React Development"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="e.g., react"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what users will learn..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={formData.difficulty_level}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty_level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTY_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="icon">Icon</Label>
                    <Select
                      value={formData.icon_name}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, icon_name: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ICON_OPTIONS.map((icon) => (
                          <SelectItem key={icon.value} value={icon.value}>
                            {icon.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="color">Color Scheme</Label>
                  <Select
                    value={formData.color_scheme}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, color_scheme: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_SCHEMES.map((scheme) => (
                        <SelectItem key={scheme.value} value={scheme.value}>
                          {scheme.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="order_index">Order</Label>
                  <Input
                    id="order_index"
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingPath ? "Update Path" : "Create Path"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paths.map((path) => (
              <TableRow key={path.id}>
                <TableCell>
                  <div className="flex items-center">
                    <GripVertical className="h-4 w-4 text-gray-400 mr-2" />
                    {path.order_index}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded bg-gradient-to-r ${path.color_scheme} text-white`}>
                      {ICON_OPTIONS.find(icon => icon.value === path.icon_name)?.icon && (
                        <div className="h-4 w-4">
                          {/* Icon would be rendered here */}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{path.name}</div>
                      <code className="text-xs text-gray-500">{path.slug}</code>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {path.category?.name || "No Category"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {DIFFICULTY_LEVELS.find(d => d.value === path.difficulty_level)?.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={path.is_active ? "default" : "secondary"}>
                    {path.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(path)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(path.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
