import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LearningPathSelection } from '@/components/learning-path-selection';
import { useLearningPaths } from '@/hooks/use-app-data';
import { supabase } from '@/lib/supabase';

// Mock the hooks and dependencies
jest.mock('@/hooks/use-app-data');
jest.mock('@/lib/supabase');

const mockUseLearningPaths = useLearningPaths as jest.MockedFunction<typeof useLearningPaths>;
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Mock data
const mockDbLearningPaths = [
  { id: 'path-1', name: 'React', slug: 'react' },
  { id: 'path-2', name: 'CSS', slug: 'css' },
  { id: 'path-3', name: 'DSA', slug: 'dsa' },
];

const mockChallengeData = [
  { id: 'challenge-1' },
  { id: 'challenge-2' },
  { id: 'challenge-3' },
];

describe('LearningPathSelection', () => {
  const mockOnSelectPath = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the useLearningPaths hook
    mockUseLearningPaths.mockReturnValue({
      data: mockDbLearningPaths,
      isLoading: false,
      error: null,
    });

    // Mock Supabase queries
    mockSupabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockChallengeData,
            error: null,
          }),
        }),
      }),
    });
  });

  it('renders learning paths correctly', async () => {
    render(<LearningPathSelection onSelectPath={mockOnSelectPath} />);

    // Check if the main heading is rendered
    expect(screen.getByText('Choose Your Learning Path')).toBeInTheDocument();

    // Check if all learning paths are rendered
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('CSS')).toBeInTheDocument();
    expect(screen.getByText('Data Structures & Algorithms')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<LearningPathSelection onSelectPath={mockOnSelectPath} />);

    // Should show loading text initially
    expect(screen.getAllByText('Loading...')).toHaveLength(3); // One for each path
  });

  it('displays challenge counts after loading', async () => {
    render(<LearningPathSelection onSelectPath={mockOnSelectPath} />);

    // Wait for challenge counts to load (should have 3 instances, one for each path)
    await waitFor(() => {
      expect(screen.getAllByText('3 challenges')).toHaveLength(3);
    });
  });

  it('allows path selection', async () => {
    render(<LearningPathSelection onSelectPath={mockOnSelectPath} />);

    // Find and click on React path
    const reactPath = screen.getByText('React').closest('div');
    fireEvent.click(reactPath!);

    // Check if the path is selected (button should show "Selected")
    await waitFor(() => {
      expect(screen.getByText('Selected')).toBeInTheDocument();
    });
  });

  it('calls onSelectPath when continue button is clicked', async () => {
    render(<LearningPathSelection onSelectPath={mockOnSelectPath} />);

    // Select a path first
    const reactPath = screen.getByText('React').closest('div');
    fireEvent.click(reactPath!);

    // Wait for selection to be processed
    await waitFor(() => {
      expect(screen.getByText('Selected')).toBeInTheDocument();
    });

    // Click continue button
    const continueButton = screen.getByText('Continue to Challenges');
    fireEvent.click(continueButton);

    // Check if onSelectPath was called with correct path
    expect(mockOnSelectPath).toHaveBeenCalledWith('react');
  });

  it('handles error state gracefully', async () => {
    // Mock Supabase to return an error
    mockSupabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      }),
    });

    render(<LearningPathSelection onSelectPath={mockOnSelectPath} />);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to load challenges for React/)).toBeInTheDocument();
    });

    // Should show fallback counts (0 challenges)
    expect(screen.getAllByText('0 challenges')).toHaveLength(3);
  });

  it('disables continue button when no path is selected', () => {
    render(<LearningPathSelection onSelectPath={mockOnSelectPath} />);

    const continueButton = screen.getByText('Continue to Challenges');
    expect(continueButton).toBeDisabled();
  });
});
