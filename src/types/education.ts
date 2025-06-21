
export interface EducationalModule {
  id: string;
  title: string;
  description: string;
  conceptLevel: 'beginner' | 'intermediate' | 'advanced';
  category: string; // e.g., 'React', 'TypeScript', 'Performance', 'Security'
  examples: CodeExample;
  quiz: QuizQuestion[];
  relatedResources: Resource[];
  metadata: {
    issueType: string; // Links to CodeIssue.type
    generatedAt: string;
    lastUpdated: string;
    timesShown: number;
    completionRate: number;
    averageScore: number;
  };
}
export interface CodeExample {
  before: {
    code: string;
    explanation: string;
    language: string; // e.g., 'typescript', 'javascript', 'jsx'
  };
  after: {
    code: string;
    explanation: string;
    language: string;
  };
  keyChanges: string[]; // Array of key improvements made
}
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  concept: string; // The specific concept being tested
}
export interface Resource {
  title: string;
  url: string;
  type: 'documentation' | 'article' | 'video' | 'example' | 'tool';
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}
export interface UserLearningProgress {
  id: string;
  userId: string;
  moduleId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  quizAttempts: QuizAttempt[];
  timeSpent: number; // in seconds
  lastAccessed: string;
  completedAt?: string;
  conceptsMastered: string[];
}
export interface QuizAttempt {
  id: string;
  timestamp: string;
  score: number;
  totalQuestions: number;
  answers: QuizAnswer[];
  timeSpent: number;
}
export interface QuizAnswer {
  questionId: string;
  selectedOption: number;
  correct: boolean;
  timeSpent: number;
}
export interface LearningAnalytics {
  userId: string;
  moduleId: string;
  event: 'module_started' | 'quiz_attempted' | 'module_completed' | 'concept_mastered';
  timestamp: string;
  metadata: {
    score?: number;
    timeSpent?: number;
    difficulty?: string;
    concept?: string;
  };
}
// Extension interface for CodeIssue (without modifying the original)
export interface CodeIssueWithEducation {
  hasEducationalContent: boolean;
  educationalModuleId?: string;
  conceptName?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  learningPriority?: number; // 1-10, higher = more important to learn
} 