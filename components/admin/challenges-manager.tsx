"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, GripVertical, Eye, TestTube } from "lucide-react";
import { useChallenges, useLearningPaths, useCreateChallenge, useUpdateChallenge, useDeleteChallenge } from "@/hooks/use-admin-data";

interface LearningPath {
  id: string;
  name: string;
  slug: string;
}

interface Challenge {
  id: string;
  legacy_id: string;
  path_id: string;
  title: string;
  description: string;
  instructions: string;
  starter_code: string;
  solution_code: string;
  difficulty: string;
  challenge_type: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  path?: LearningPath;
}

interface ChallengesManagerProps {
  onStatsUpdate: () => void;
}

const DIFFICULTY_LEVELS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" }
];

const CHALLENGE_TYPES = [
  { value: "component", label: "Component" },
  { value: "styling", label: "Styling" },
  { value: "logic", label: "Logic" },
  { value: "algorithm", label: "Algorithm" }
];

export function ChallengesManager({ onStatsUpdate }: ChallengesManagerProps) {
  const { toast } = useToast();
  const { data: challenges = [], isLoading: challengesLoading, error: challengesError } = useChallenges();
  const { data: paths = [], isLoading: pathsLoading } = useLearningPaths();
  const createChallengeMutation = useCreateChallenge();
  const updateChallengeMutation = useUpdateChallenge();
  const deleteChallengeMutation = useDeleteChallenge();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [selectedPath, setSelectedPath] = useState<string>("all");
  const [formData, setFormData] = useState({
    legacy_id: "",
    path_id: "",
    title: "",
    description: "",
    instructions: "",
    starter_code: "",
    solution_code: "",
    difficulty: "easy",
    challenge_type: "component",
    order_index: 0,
    is_active: true
  });

  const loading = challengesLoading || pathsLoading;

  if (challengesError) {
    console.error('Error loading challenges:', challengesError);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingChallenge) {
        // Update existing challenge
        await updateChallengeMutation.mutateAsync({
          id: editingChallenge.id,
          legacy_id: formData.legacy_id,
          path_id: formData.path_id,
          title: formData.title,
          description: formData.description,
          instructions: formData.instructions,
          starter_code: formData.starter_code,
          solution_code: formData.solution_code,
          difficulty: formData.difficulty,
          challenge_type: formData.challenge_type,
          order_index: formData.order_index,
          is_active: formData.is_active,
          updated_at: new Date().toISOString()
        });

        toast({
          title: "Success",
          description: "Challenge updated successfully",
        });
      } else {
        // Create new challenge
        await createChallengeMutation.mutateAsync({
          legacy_id: formData.legacy_id,
          path_id: formData.path_id,
          title: formData.title,
          description: formData.description,
          instructions: formData.instructions,
          starter_code: formData.starter_code,
          solution_code: formData.solution_code,
          difficulty: formData.difficulty,
          challenge_type: formData.challenge_type,
          order_index: formData.order_index,
          is_active: formData.is_active
        });

        toast({
          title: "Success",
          description: "Challenge created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingChallenge(null);
      resetForm();
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error saving challenge:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save challenge",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      legacy_id: "",
      path_id: "",
      title: "",
      description: "",
      instructions: "",
      starter_code: "",
      solution_code: "",
      difficulty: "easy",
      challenge_type: "component",
      order_index: 0,
      is_active: true
    });
  };

  const handleEdit = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setFormData({
      legacy_id: challenge.legacy_id || "",
      path_id: challenge.path_id,
      title: challenge.title,
      description: challenge.description,
      instructions: challenge.instructions || "",
      starter_code: challenge.starter_code || "",
      solution_code: challenge.solution_code || "",
      difficulty: challenge.difficulty,
      challenge_type: challenge.challenge_type,
      order_index: challenge.order_index,
      is_active: challenge.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (challengeId: string) => {
    if (!confirm("Are you sure you want to delete this challenge? This will also delete all associated test cases and user progress.")) {
      return;
    }

    try {
      await deleteChallengeMutation.mutateAsync(challengeId);

      toast({
        title: "Success",
        description: "Challenge deleted successfully",
      });
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error deleting challenge:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete challenge",
        variant: "destructive",
      });
    }
  };

  const generateLegacyId = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      legacy_id: prev.legacy_id || generateLegacyId(title)
    }));
  };

  const filteredChallenges = selectedPath === "all"
    ? challenges
    : challenges.filter(challenge => challenge.path_id === selectedPath);

  if (loading) {
    return <Loading text="Loading challenges..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Challenges</h3>
          <p className="text-sm text-gray-600">
            Create and manage challenges within learning paths
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedPath} onValueChange={setSelectedPath}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by path" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Paths</SelectItem>
              {paths.map((path) => (
                <SelectItem key={path.id} value={path.id}>
                  {path.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingChallenge(null);
                resetForm();
                setFormData(prev => ({
                  ...prev,
                  order_index: filteredChallenges.length,
                  path_id: selectedPath !== "all" ? selectedPath : ""
                }));
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Challenge
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingChallenge ? "Edit Challenge" : "Create New Challenge"}
                </DialogTitle>
                <DialogDescription>
                  {editingChallenge
                    ? "Update the challenge details below."
                    : "Add a new challenge to a learning path."
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="e.g., Button Component"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="legacy_id">Legacy ID</Label>
                      <Input
                        id="legacy_id"
                        value={formData.legacy_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, legacy_id: e.target.value }))}
                        placeholder="e.g., button-component"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="path">Learning Path</Label>
                    <Select
                      value={formData.path_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, path_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a learning path" />
                      </SelectTrigger>
                      <SelectContent>
                        {paths.map((path) => (
                          <SelectItem key={path.id} value={path.id}>
                            {path.name}
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
                      placeholder="Brief description of what the challenge teaches..."
                      rows={2}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={formData.instructions}
                      onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                      placeholder="Detailed instructions for the challenge..."
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="starter_code">Starter Code</Label>
                    <Textarea
                      id="starter_code"
                      value={formData.starter_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, starter_code: e.target.value }))}
                      placeholder="Initial code template..."
                      rows={4}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="solution_code">Solution Code</Label>
                    <Textarea
                      id="solution_code"
                      value={formData.solution_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, solution_code: e.target.value }))}
                      placeholder="Complete solution..."
                      rows={4}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
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
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={formData.challenge_type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, challenge_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CHALLENGE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
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
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingChallenge ? "Update Challenge" : "Create Challenge"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Path</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredChallenges.map((challenge) => (
              <TableRow key={challenge.id}>
                <TableCell>
                  <div className="flex items-center">
                    <GripVertical className="h-4 w-4 text-gray-400 mr-2" />
                    {challenge.order_index}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{challenge.title}</div>
                    <code className="text-xs text-gray-500">{challenge.legacy_id}</code>
                  </div>
                </TableCell>
                <TableCell>
                  {challenge.path?.name || "Unknown Path"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {CHALLENGE_TYPES.find(t => t.value === challenge.challenge_type)?.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {DIFFICULTY_LEVELS.find(d => d.value === challenge.difficulty)?.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={challenge.is_active ? "default" : "secondary"}>
                    {challenge.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(challenge)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(challenge.id)}
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
