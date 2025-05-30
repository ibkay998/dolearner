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
import { Plus, Edit, Trash2, TestTube, Play, Copy } from "lucide-react";
import { useTestCases, useChallenges, useCreateTestCase, useUpdateTestCase, useDeleteTestCase } from "@/hooks/use-admin-data";

interface Challenge {
  id: string;
  legacy_id: string;
  title: string;
  path?: {
    name: string;
    slug: string;
  };
}

interface TestCase {
  id: string;
  challenge_id: string;
  test_type: string;
  description: string;
  test_code: string;
  expected_result: any;
  test_config: any;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  challenge?: Challenge;
}

const TEST_TYPES = [
  { value: "unit", label: "Unit Test" },
  { value: "integration", label: "Integration Test" },
  { value: "visual", label: "Visual Test" },
  { value: "performance", label: "Performance Test" }
];

export function TestCasesManager() {
  const { toast } = useToast();
  const { data: testCases = [], isLoading: testCasesLoading, error: testCasesError } = useTestCases();
  const { data: challenges = [], isLoading: challengesLoading } = useChallenges();
  const createTestCaseMutation = useCreateTestCase();
  const updateTestCaseMutation = useUpdateTestCase();
  const deleteTestCaseMutation = useDeleteTestCase();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<string>("all");
  const [formData, setFormData] = useState({
    challenge_id: "",
    test_type: "unit",
    description: "",
    test_code: "",
    expected_result: "",
    test_config: "{}",
    order_index: 0,
    is_active: true
  });

  const loading = testCasesLoading || challengesLoading;

  if (testCasesError) {
    console.error('Error loading test cases:', testCasesError);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let expectedResult;
      try {
        expectedResult = JSON.parse(formData.expected_result);
      } catch {
        expectedResult = formData.expected_result;
      }

      let testConfig;
      try {
        testConfig = JSON.parse(formData.test_config);
      } catch {
        testConfig = {};
      }

      if (editingTestCase) {
        // Update existing test case
        await updateTestCaseMutation.mutateAsync({
          id: editingTestCase.id,
          challenge_id: formData.challenge_id,
          test_type: formData.test_type,
          description: formData.description,
          test_code: formData.test_code,
          expected_result: expectedResult,
          test_config: testConfig,
          order_index: formData.order_index,
          is_active: formData.is_active,
          updated_at: new Date().toISOString()
        });

        toast({
          title: "Success",
          description: "Test case updated successfully",
        });
      } else {
        // Create new test case
        await createTestCaseMutation.mutateAsync({
          challenge_id: formData.challenge_id,
          test_type: formData.test_type,
          description: formData.description,
          test_code: formData.test_code,
          expected_result: expectedResult,
          test_config: testConfig,
          order_index: formData.order_index,
          is_active: formData.is_active
        });

        toast({
          title: "Success",
          description: "Test case created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingTestCase(null);
      resetForm();
    } catch (error: any) {
      console.error('Error saving test case:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save test case",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      challenge_id: "",
      test_type: "unit",
      description: "",
      test_code: "",
      expected_result: "",
      test_config: "{}",
      order_index: 0,
      is_active: true
    });
  };

  const handleEdit = (testCase: TestCase) => {
    setEditingTestCase(testCase);
    setFormData({
      challenge_id: testCase.challenge_id,
      test_type: testCase.test_type,
      description: testCase.description,
      test_code: testCase.test_code,
      expected_result: JSON.stringify(testCase.expected_result, null, 2),
      test_config: JSON.stringify(testCase.test_config, null, 2),
      order_index: testCase.order_index,
      is_active: testCase.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (testCaseId: string) => {
    if (!confirm("Are you sure you want to delete this test case?")) {
      return;
    }

    try {
      await deleteTestCaseMutation.mutateAsync(testCaseId);

      toast({
        title: "Success",
        description: "Test case deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting test case:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete test case",
        variant: "destructive",
      });
    }
  };

  const handleCopyTestCode = (testCode: string) => {
    navigator.clipboard.writeText(testCode);
    toast({
      title: "Copied",
      description: "Test code copied to clipboard",
    });
  };

  const filteredTestCases = selectedChallenge === "all"
    ? testCases
    : testCases.filter(testCase => testCase.challenge_id === selectedChallenge);

  if (loading) {
    return <Loading text="Loading test cases..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Test Cases</h3>
          <p className="text-sm text-gray-600">
            Manage test cases for challenge evaluation
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedChallenge} onValueChange={setSelectedChallenge}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by challenge" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Challenges</SelectItem>
              {challenges.map((challenge) => (
                <SelectItem key={challenge.id} value={challenge.id}>
                  {challenge.title} ({challenge.path?.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingTestCase(null);
                resetForm();
                setFormData(prev => ({
                  ...prev,
                  order_index: filteredTestCases.length,
                  challenge_id: selectedChallenge !== "all" ? selectedChallenge : ""
                }));
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Test Case
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTestCase ? "Edit Test Case" : "Create New Test Case"}
                </DialogTitle>
                <DialogDescription>
                  {editingTestCase
                    ? "Update the test case details below."
                    : "Add a new test case to evaluate challenge solutions."
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="challenge">Challenge</Label>
                    <Select
                      value={formData.challenge_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, challenge_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a challenge" />
                      </SelectTrigger>
                      <SelectContent>
                        {challenges.map((challenge) => (
                          <SelectItem key={challenge.id} value={challenge.id}>
                            {challenge.title} ({challenge.path?.name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="test_type">Test Type</Label>
                      <Select
                        value={formData.test_type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, test_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TEST_TYPES.map((type) => (
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
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of what this test validates..."
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="test_code">Test Code</Label>
                    <Textarea
                      id="test_code"
                      value={formData.test_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, test_code: e.target.value }))}
                      placeholder="JavaScript test code..."
                      rows={6}
                      className="font-mono text-sm"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="expected_result">Expected Result (JSON)</Label>
                    <Textarea
                      id="expected_result"
                      value={formData.expected_result}
                      onChange={(e) => setFormData(prev => ({ ...prev, expected_result: e.target.value }))}
                      placeholder='{"pass": true, "message": "Test passed"}'
                      rows={3}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="test_config">Test Configuration (JSON)</Label>
                    <Textarea
                      id="test_config"
                      value={formData.test_config}
                      onChange={(e) => setFormData(prev => ({ ...prev, test_config: e.target.value }))}
                      placeholder='{"timeout": 5000, "retries": 3}'
                      rows={3}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingTestCase ? "Update Test Case" : "Create Test Case"}
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
              <TableHead>Challenge</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTestCases.map((testCase) => (
              <TableRow key={testCase.id}>
                <TableCell>{testCase.order_index}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{testCase.challenge?.title}</div>
                    <div className="text-xs text-gray-500">{testCase.challenge?.path?.name}</div>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {testCase.description}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {TEST_TYPES.find(t => t.value === testCase.test_type)?.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={testCase.is_active ? "default" : "secondary"}>
                    {testCase.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyTestCode(testCase.test_code)}
                      title="Copy test code"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(testCase)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(testCase.id)}
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
