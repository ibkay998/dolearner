"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { usePathCategories, useCreatePathCategory, useUpdatePathCategory, useDeletePathCategory } from "@/hooks/use-admin-data";

interface PathCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PathCategoriesManagerProps {
  onStatsUpdate: () => void;
}

export function PathCategoriesManager({ onStatsUpdate }: PathCategoriesManagerProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PathCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    order_index: 0,
    is_active: true
  });

  // React Query hooks
  const { data: categories = [], isLoading: loading, error } = usePathCategories();
  const createCategoryMutation = useCreatePathCategory();
  const updateCategoryMutation = useUpdatePathCategory();
  const deleteCategoryMutation = useDeletePathCategory();

  // Handle query error
  if (error) {
    console.error('Error loading categories:', error);
    toast({
      title: "Error",
      description: "Failed to load categories",
      variant: "destructive",
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        // Update existing category
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          name: formData.name,
          description: formData.description,
          slug: formData.slug,
          order_index: formData.order_index,
          is_active: formData.is_active
        });

        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        // Create new category
        await createCategoryMutation.mutateAsync({
          name: formData.name,
          description: formData.description,
          slug: formData.slug,
          order_index: formData.order_index,
          is_active: formData.is_active
        });

        toast({
          title: "Success",
          description: "Category created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        slug: "",
        order_index: 0,
        is_active: true
      });
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save category",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: PathCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      slug: category.slug,
      order_index: category.order_index,
      is_active: category.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteCategoryMutation.mutateAsync(categoryId);

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
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
    return <Loading text="Loading categories..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Path Categories</h3>
          <p className="text-sm text-gray-600">
            Organize learning paths into logical categories
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCategory(null);
              setFormData({
                name: "",
                description: "",
                slug: "",
                order_index: categories.length,
                is_active: true
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Create New Category"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Update the category details below."
                  : "Add a new category to organize learning paths."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., Frontend Development"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="e.g., frontend"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this category covers..."
                    rows={3}
                  />
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
                  {editingCategory ? "Update Category" : "Create Category"}
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
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="flex items-center">
                    <GripVertical className="h-4 w-4 text-gray-400 mr-2" />
                    {category.order_index}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {category.slug}
                  </code>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {category.description}
                </TableCell>
                <TableCell>
                  <Badge variant={category.is_active ? "default" : "secondary"}>
                    {category.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
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
