"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { allChallenges } from '@/data/challenges';
import testTemplates from './test-templates';
import { getTestsForChallenge } from './all-tests';
import { BulkOperations } from './bulk-operations';
import { Search, Play, Download, Upload, Eye, EyeOff, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ChallengeTest {
  id: string;
  challenge_id: string;
  description: string;
  test_code: string;
  expected_result?: any;
  created_at: string;
  updated_at: string;
}

export default function TestsAdminPage() {
  const [selectedChallenge, setSelectedChallenge] = useState<string>('');
  const [tests, setTests] = useState<ChallengeTest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showTestCode, setShowTestCode] = useState<{[key: string]: boolean}>({});
  const [testCoverage, setTestCoverage] = useState<{[key: string]: number}>({});
  const [newTest, setNewTest] = useState({
    description: '',
    testCode: '',
    expectedResult: '{ "pass": true }'
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('none');
  const [selectedChallengeTest, setSelectedChallengeTest] = useState<string>('none');
  const [challengeSpecificTests, setChallengSpecificTests] = useState<{[key: string]: string}>({});
  const [editingTest, setEditingTest] = useState<ChallengeTest | null>(null);
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Load test coverage for all challenges on component mount
  useEffect(() => {
    console.log('Component mounted, allChallenges:', allChallenges);
    loadTestCoverage();
  }, []);

  // Load tests when the selected challenge changes
  useEffect(() => {
    console.log('Selected challenge changed:', selectedChallenge);
    if (selectedChallenge) {
      loadTests(selectedChallenge);

      // Load challenge-specific tests
      const challengeTests = getTestsForChallenge(selectedChallenge);
      if (challengeTests && Object.keys(challengeTests).length > 0) {
        setChallengSpecificTests(challengeTests);
        setSelectedChallengeTest('none'); // Reset selection
      } else {
        setChallengSpecificTests({});
      }
    } else {
      setTests([]);
      setChallengSpecificTests({});
    }
  }, [selectedChallenge]);

  // Load test coverage for all challenges
  const loadTestCoverage = async () => {
    console.log('Loading test coverage for', allChallenges.length, 'challenges');
    try {
      const coverage: {[key: string]: number} = {};

      for (const challenge of allChallenges) {
        console.log('Fetching tests for challenge:', challenge.id);
        const response = await fetch(`/api/challenge-tests?challengeId=${challenge.id}`);
        if (response.ok) {
          const data = await response.json();
          coverage[challenge.id] = data.tests?.length || 0;
          console.log(`Challenge ${challenge.id}: ${coverage[challenge.id]} tests`);
        } else {
          console.warn(`Failed to fetch tests for ${challenge.id}:`, response.statusText);
          coverage[challenge.id] = 0;
        }
      }

      console.log('Final coverage:', coverage);
      setTestCoverage(coverage);
    } catch (error) {
      console.error('Error loading test coverage:', error);
    }
  };

  // Helper functions
  const toggleTestCodeVisibility = (testId: string) => {
    setShowTestCode(prev => ({
      ...prev,
      [testId]: !prev[testId]
    }));
  };

  const filteredTests = tests.filter(test =>
    test.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.test_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTestStatusIcon = (test: ChallengeTest) => {
    // Simple validation - check if test code sets TestResult
    const hasTestResult = test.test_code.includes('TestResult');
    return hasTestResult ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  // Load tests for a challenge
  const loadTests = async (challengeId: string) => {
    console.log('Loading tests for challenge:', challengeId);
    setLoading(true);
    try {
      const response = await fetch(`/api/challenge-tests?challengeId=${challengeId}`);
      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Failed to load tests: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      setTests(data.tests || []);

      // Update test coverage for this challenge
      setTestCoverage(prev => ({
        ...prev,
        [challengeId]: data.tests?.length || 0
      }));

      if (data.tests?.length === 0) {
        toast({
          title: 'No Tests Found',
          description: `No tests found for challenge "${challengeId}". You can add tests using the "Add New Test" tab.`,
          variant: 'default'
        });
      } else {
        console.log(`Loaded ${data.tests.length} tests for ${challengeId}`);
      }
    } catch (error) {
      console.error('Error loading tests:', error);
      setTests([]);
      toast({
        title: 'Error Loading Tests',
        description: `Failed to load tests: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new test
  const createTest = async () => {
    if (!selectedChallenge) {
      toast({
        title: 'Error',
        description: 'Please select a challenge first',
        variant: 'destructive'
      });
      return;
    }

    if (!newTest.description || !newTest.testCode) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      let expectedResult = null;
      try {
        expectedResult = JSON.parse(newTest.expectedResult);
      } catch (e) {
        toast({
          title: 'Warning',
          description: 'Expected result is not valid JSON, using null instead',
          variant: 'default'
        });
      }

      try {
        const response = await fetch('/api/challenge-tests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            challengeId: selectedChallenge,
            description: newTest.description,
            testCode: newTest.testCode,
            expectedResult
          })
        });

        if (!response.ok) {
          console.warn(`Failed to create test via API: ${response.statusText}`);
          throw new Error(`Failed to create test: ${response.statusText}`);
        }

        toast({
          title: 'Success',
          description: 'Test created successfully',
          variant: 'default'
        });

        // Reload tests to get the latest data
        loadTests(selectedChallenge);
      } catch (apiError) {
        console.error('API error:', apiError);

        // Add the test to the local state
        const newTestObj = {
          id: `local-${Date.now()}`,
          challenge_id: selectedChallenge,
          description: newTest.description,
          test_code: newTest.testCode,
          expected_result: expectedResult,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setTests(prev => [...prev, newTestObj]);

        // Update test coverage
        setTestCoverage(prev => ({
          ...prev,
          [selectedChallenge]: (prev[selectedChallenge] || 0) + 1
        }));

        toast({
          title: 'Local Mode',
          description: 'Test added locally (API unavailable)',
          variant: 'default'
        });
      }

      // Reset form
      setNewTest({
        description: '',
        testCode: '',
        expectedResult: '{ "pass": true }'
      });
      setSelectedTemplate('none');
      setSelectedChallengeTest('none');
    } catch (error) {
      console.error('Error creating test:', error);
      toast({
        title: 'Error',
        description: `Failed to create test: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Update an existing test
  const updateTest = async () => {
    if (!editingTest) {
      return;
    }

    setLoading(true);
    try {
      let expectedResult = null;
      try {
        expectedResult = typeof editingTest.expected_result === 'string'
          ? JSON.parse(editingTest.expected_result)
          : editingTest.expected_result;
      } catch (e) {
        toast({
          title: 'Warning',
          description: 'Expected result is not valid JSON, using null instead',
          variant: 'default'
        });
      }

      // Check if this is a local test (id starts with "local-")
      const isLocalTest = editingTest.id.startsWith('local-');

      if (isLocalTest) {
        // Update the test in local state
        setTests(prev => prev.map(test =>
          test.id === editingTest.id
            ? {
                ...editingTest,
                expected_result: expectedResult,
                updated_at: new Date().toISOString()
              }
            : test
        ));

        toast({
          title: 'Success',
          description: 'Test updated locally',
          variant: 'default'
        });

        setEditingTest(null);
        return;
      }

      try {
        const response = await fetch('/api/challenge-tests', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: editingTest.id,
            description: editingTest.description,
            testCode: editingTest.test_code,
            expectedResult
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to update test: ${response.statusText}`);
        }

        toast({
          title: 'Success',
          description: 'Test updated successfully',
          variant: 'default'
        });

        // Reset form and reload tests
        setEditingTest(null);
        loadTests(selectedChallenge);
      } catch (apiError) {
        console.error('API error:', apiError);

        // Update the test in local state
        setTests(prev => prev.map(test =>
          test.id === editingTest.id
            ? {
                ...editingTest,
                expected_result: expectedResult,
                updated_at: new Date().toISOString()
              }
            : test
        ));

        toast({
          title: 'Local Mode',
          description: 'Test updated locally (API unavailable)',
          variant: 'default'
        });

        setEditingTest(null);
      }
    } catch (error) {
      console.error('Error updating test:', error);
      toast({
        title: 'Error',
        description: `Failed to update test: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete a test
  const deleteTest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test?')) {
      return;
    }

    setLoading(true);
    try {
      // Check if this is a local test (id starts with "local-")
      const isLocalTest = id.startsWith('local-');

      if (isLocalTest) {
        // Remove the test from local state
        setTests(prev => prev.filter(test => test.id !== id));

        toast({
          title: 'Success',
          description: 'Test deleted locally',
          variant: 'default'
        });

        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/challenge-tests?id=${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`Failed to delete test: ${response.statusText}`);
        }

        toast({
          title: 'Success',
          description: 'Test deleted successfully',
          variant: 'default'
        });

        // Reload tests to refresh coverage
        loadTests(selectedChallenge);
      } catch (apiError) {
        console.error('API error:', apiError);

        // Remove the test from local state
        setTests(prev => prev.filter(test => test.id !== id));

        // Update test coverage
        setTestCoverage(prev => ({
          ...prev,
          [selectedChallenge]: Math.max(0, (prev[selectedChallenge] || 0) - 1)
        }));

        toast({
          title: 'Local Mode',
          description: 'Test deleted locally (API unavailable)',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      toast({
        title: 'Error',
        description: `Failed to delete test: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Challenge Tests Admin</h1>

      {/* Test Coverage Dashboard */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Test Coverage Overview
          </CardTitle>
          <CardDescription>
            Overview of test coverage across all challenges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allChallenges.map(challenge => (
              <div
                key={challenge.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedChallenge === challenge.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  console.log('Challenge card clicked:', challenge.id);
                  setSelectedChallenge(challenge.id);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{challenge.title}</h3>
                  <Badge variant={testCoverage[challenge.id] > 0 ? 'default' : 'secondary'}>
                    {testCoverage[challenge.id] || 0} tests
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{challenge.id}</p>
                <div className="flex items-center gap-2">
                  {testCoverage[challenge.id] > 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {testCoverage[challenge.id] > 0 ? 'Has tests' : 'No tests'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Select a Challenge</h2>
        <Select
          value={selectedChallenge}
          onValueChange={setSelectedChallenge}
        >
          <SelectTrigger className="w-full md:w-[400px]">
            <SelectValue placeholder="Select a challenge" />
          </SelectTrigger>
          <SelectContent>
            {allChallenges.map(challenge => (
              <SelectItem key={challenge.id} value={challenge.id}>
                {challenge.title} ({challenge.id}) - {testCoverage[challenge.id] || 0} tests
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedChallenge && (
        <Tabs defaultValue="existing">
          <TabsList className="mb-4">
            <TabsTrigger value="existing">Existing Tests</TabsTrigger>
            <TabsTrigger value="new">Add New Test</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          </TabsList>

          <TabsContent value="existing">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Existing Tests</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Badge variant="outline">
                  {filteredTests.length} of {tests.length} tests
                </Badge>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Clock className="h-6 w-6 animate-spin mr-2" />
                <p>Loading tests...</p>
              </div>
            ) : filteredTests.length === 0 ? (
              <Alert>
                <AlertTitle>
                  {tests.length === 0 ? 'No tests found' : 'No matching tests'}
                </AlertTitle>
                <AlertDescription>
                  {tests.length === 0
                    ? 'There are no tests for this challenge yet. Add a new test to get started.'
                    : 'No tests match your search criteria. Try adjusting your search term.'
                  }
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {filteredTests.map(test => (
                  <Card key={test.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTestStatusIcon(test)}
                          <CardTitle>{test.description}</CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTestCodeVisibility(test.id)}
                        >
                          {showTestCode[test.id] ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-1" />
                              Hide Code
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-1" />
                              Show Code
                            </>
                          )}
                        </Button>
                      </div>
                      <CardDescription>
                        Created: {new Date(test.created_at).toLocaleString()}
                        {test.updated_at !== test.created_at && (
                          <> • Updated: {new Date(test.updated_at).toLocaleString()}</>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {showTestCode[test.id] && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Test Code:</h4>
                          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
                            {test.test_code}
                          </pre>
                        </div>
                      )}
                      {test.expected_result && (
                        <div>
                          <h4 className="font-medium mb-2">Expected Result:</h4>
                          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
                            {typeof test.expected_result === 'string'
                              ? test.expected_result
                              : JSON.stringify(test.expected_result, null, 2)}
                          </pre>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditingTest(test)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => deleteTest(test.id)}
                      >
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="new">
            <h2 className="text-xl font-semibold mb-4">Add New Test</h2>
            <Card>
              <CardHeader>
                <CardTitle>New Test for {selectedChallenge}</CardTitle>
                <CardDescription>
                  Create a new test for this challenge. The test code should set the TestResult variable.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Description:</label>
                  <Input
                    value={newTest.description}
                    onChange={e => setNewTest({ ...newTest, description: e.target.value })}
                    placeholder="What does this test check for?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Test Code:</label>
                  <div className="space-y-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">General Templates:</label>
                      <Select
                        value={selectedTemplate}
                        onValueChange={(value) => {
                          setSelectedTemplate(value);
                          setSelectedChallengeTest('none'); // Reset the other dropdown
                          if (value && value !== "none" && testTemplates[value as keyof typeof testTemplates]) {
                            setNewTest({
                              ...newTest,
                              testCode: testTemplates[value as keyof typeof testTemplates]
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a template (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No template</SelectItem>
                          <SelectItem value="basic">Basic Element Check</SelectItem>
                          <SelectItem value="stateCheck">State Usage Check</SelectItem>
                          <SelectItem value="eventHandler">Event Handler Check</SelectItem>
                          <SelectItem value="cssCheck">CSS Class Check</SelectItem>
                          <SelectItem value="propsCheck">Props Usage Check</SelectItem>
                          <SelectItem value="childrenCheck">Children Rendering Check</SelectItem>
                          <SelectItem value="accessibilityCheck">Accessibility Check</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {Object.keys(challengeSpecificTests).length > 0 && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Challenge-Specific Tests:</label>
                        <Select
                          value={selectedChallengeTest}
                          onValueChange={(value) => {
                            setSelectedChallengeTest(value);
                            setSelectedTemplate('none'); // Reset the other dropdown
                            if (value && value !== "none" && challengeSpecificTests[value]) {
                              setNewTest({
                                ...newTest,
                                testCode: challengeSpecificTests[value],
                                description: value.split(/(?=[A-Z])/).join(' ') // Convert camelCase to spaces
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a challenge-specific test" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No test</SelectItem>
                            {Object.keys(challengeSpecificTests).map(testKey => (
                              <SelectItem key={testKey} value={testKey}>
                                {testKey.split(/(?=[A-Z])/).join(' ')} {/* Convert camelCase to spaces */}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <Textarea
                    value={newTest.testCode}
                    onChange={e => setNewTest({ ...newTest, testCode: e.target.value })}
                    placeholder="// Your test code here. Set TestResult = { pass: true/false, message: 'Your message' }"
                    className="font-mono"
                    rows={10}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expected Result (JSON):</label>
                  <Textarea
                    value={newTest.expectedResult}
                    onChange={e => setNewTest({ ...newTest, expectedResult: e.target.value })}
                    placeholder='{ "pass": true }'
                    className="font-mono"
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={createTest}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Test'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="bulk">
            <h2 className="text-xl font-semibold mb-4">Bulk Operations</h2>
            <BulkOperations
              selectedChallenge={selectedChallenge}
              tests={tests}
              onTestsUpdated={() => loadTests(selectedChallenge)}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Edit Test Modal */}
      {editingTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Edit Test</CardTitle>
              <CardDescription>
                Update the test for challenge {editingTest.challenge_id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Description:</label>
                <Input
                  value={editingTest.description}
                  onChange={e => setEditingTest({ ...editingTest, description: e.target.value })}
                  placeholder="What does this test check for?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Test Code:</label>
                <Textarea
                  value={editingTest.test_code}
                  onChange={e => setEditingTest({ ...editingTest, test_code: e.target.value })}
                  placeholder="// Your test code here. Set TestResult = { pass: true/false, message: 'Your message' }"
                  className="font-mono"
                  rows={10}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expected Result (JSON):</label>
                <Textarea
                  value={typeof editingTest.expected_result === 'string'
                    ? editingTest.expected_result
                    : JSON.stringify(editingTest.expected_result, null, 2)}
                  onChange={e => setEditingTest({ ...editingTest, expected_result: e.target.value })}
                  placeholder='{ "pass": true }'
                  className="font-mono"
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setEditingTest(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={updateTest}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Test'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
