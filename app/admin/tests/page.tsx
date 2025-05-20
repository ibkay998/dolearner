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
import { useToast } from '@/components/ui/use-toast';
import { allChallenges } from '@/data/challenges';
import testTemplates from './test-templates';
import { getTestsForChallenge } from './all-tests';

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
  const [newTest, setNewTest] = useState({
    description: '',
    testCode: '',
    expectedResult: '{ "pass": true }'
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('none');
  const [selectedChallengeTest, setSelectedChallengeTest] = useState<string>('none');
  const [challengeSpecificTests, setChallengSpecificTests] = useState<{[key: string]: string}>({});
  const [editingTest, setEditingTest] = useState<ChallengeTest | null>(null);
  const { toast } = useToast();

  // Load tests when the selected challenge changes
  useEffect(() => {
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

  // Mock tests for development if needed
  const mockTests = (challengeId: string) => {
    return [
      {
        id: '1',
        challenge_id: challengeId,
        description: 'Check if component renders a button',
        test_code: `// Check if the component renders a button element
const containsButton = componentCode.includes('<button');

TestResult = {
  pass: containsButton,
  message: containsButton
    ? 'Component contains a button element'
    : 'Component should contain a button element'
};`,
        expected_result: { pass: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        challenge_id: challengeId,
        description: 'Check if component has proper styling',
        test_code: `// Check if the component has proper styling
const hasClassName = componentCode.includes('className=');

TestResult = {
  pass: hasClassName,
  message: hasClassName
    ? 'Component has proper styling with className'
    : 'Component should use className for styling'
};`,
        expected_result: { pass: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  };

  // Load tests for a challenge
  const loadTests = async (challengeId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/challenge-tests?challengeId=${challengeId}`);
      if (!response.ok) {
        console.warn(`Failed to load tests from API: ${response.statusText}`);
        console.log('Using mock tests instead');

        // Use mock tests if the API fails
        setTests(mockTests(challengeId));
        return;
      }
      const data = await response.json();

      // If we got an empty array from the API, use mock tests
      if (!data.tests || data.tests.length === 0) {
        console.log('No tests found in database, using mock tests');
        setTests(mockTests(challengeId));
      } else {
        setTests(data.tests);
      }
    } catch (error) {
      console.error('Error loading tests:', error);
      toast({
        title: 'Warning',
        description: `Using mock tests due to API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'default'
      });

      // Use mock tests if there's an error
      setTests(mockTests(challengeId));
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

      // No need to reload tests if we're in local mode
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

        // Reload tests
        loadTests(selectedChallenge);
      } catch (apiError) {
        console.error('API error:', apiError);

        // Remove the test from local state
        setTests(prev => prev.filter(test => test.id !== id));

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
                {challenge.title} ({challenge.id})
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
          </TabsList>

          <TabsContent value="existing">
            <h2 className="text-xl font-semibold mb-4">Existing Tests</h2>
            {loading ? (
              <p>Loading tests...</p>
            ) : tests.length === 0 ? (
              <Alert>
                <AlertTitle>No tests found</AlertTitle>
                <AlertDescription>
                  There are no tests for this challenge yet. Add a new test to get started.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {tests.map(test => (
                  <Card key={test.id}>
                    <CardHeader>
                      <CardTitle>{test.description}</CardTitle>
                      <CardDescription>Created: {new Date(test.created_at).toLocaleString()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Test Code:</h4>
                        <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                          {test.test_code}
                        </pre>
                      </div>
                      {test.expected_result && (
                        <div>
                          <h4 className="font-medium mb-2">Expected Result:</h4>
                          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
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
