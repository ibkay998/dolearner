"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Download, Upload } from 'lucide-react';

interface ChallengeTest {
  id: string;
  challenge_id: string;
  description: string;
  test_code: string;
  expected_result?: any;
  created_at: string;
  updated_at: string;
}

interface BulkOperationsProps {
  selectedChallenge: string;
  tests: ChallengeTest[];
  onTestsUpdated: () => void;
}

export function BulkOperations({ selectedChallenge, tests, onTestsUpdated }: BulkOperationsProps) {
  const [importData, setImportData] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const exportTests = () => {
    const exportData = {
      challenge_id: selectedChallenge,
      tests: tests.map(test => ({
        description: test.description,
        test_code: test.test_code,
        expected_result: test.expected_result
      })),
      exported_at: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedChallenge}-tests.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: `Exported ${tests.length} tests for ${selectedChallenge}`,
      variant: 'default'
    });
  };

  const importTests = async () => {
    if (!importData.trim()) {
      toast({
        title: 'Error',
        description: 'Please paste the test data to import',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const data = JSON.parse(importData);
      
      if (!data.tests || !Array.isArray(data.tests)) {
        throw new Error('Invalid format: tests array not found');
      }

      let successCount = 0;
      let errorCount = 0;

      for (const test of data.tests) {
        try {
          const response = await fetch('/api/challenge-tests', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              challengeId: selectedChallenge,
              description: test.description,
              testCode: test.test_code,
              expectedResult: test.expected_result
            })
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      toast({
        title: 'Import Complete',
        description: `Successfully imported ${successCount} tests. ${errorCount} failed.`,
        variant: successCount > 0 ? 'default' : 'destructive'
      });

      if (successCount > 0) {
        setImportData('');
        onTestsUpdated();
      }
    } catch (error) {
      toast({
        title: 'Import Error',
        description: `Failed to parse import data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Tests
          </CardTitle>
          <CardDescription>
            Export all tests for this challenge as a JSON file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={exportTests}
            disabled={tests.length === 0}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Export {tests.length} Tests
          </Button>
        </CardContent>
      </Card>

      {/* Import Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Tests
          </CardTitle>
          <CardDescription>
            Import tests from a JSON file. Paste the content below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your test data here (JSON format)..."
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
          <Button 
            onClick={importTests}
            disabled={!importData.trim() || loading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {loading ? 'Importing...' : 'Import Tests'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
