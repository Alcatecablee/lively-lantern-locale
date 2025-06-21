import { EducationalModule, QuizQuestion, CodeExample, Resource } from '@/types/education';
// Sample educational modules for different code issue types
export const sampleEducationalModules: Record<string, EducationalModule> = {
  'unused-variable': {
    id: 'edu-unused-var-001',
    title: 'Understanding Unused Variables',
    description: 'Learn why unused variables are problematic and how to identify and remove them effectively.',;
    conceptLevel: 'beginner',;
    category: 'Code Quality',;
    examples: {;
      before: {;
        code: `function calculateTotal(price, tax, discount) {;
  const unusedVariable = 'This is never used';
  const extraVar = 100;
  return price + (price * tax);
}`,
        explanation: 'This code has unused variables that clutter the codebase and can confuse other developers.',
        language: 'javascript'
      },
      after: {
        code: `function calculateTotal(price, tax) {
  return price + (price * tax);
}`,
        explanation: 'Clean code with only the variables that are actually needed for the calculation.',
        language: 'javascript'
      },
      keyChanges: [
        'Removed unused variables that served no purpose',
        'Simplified function parameters to only include what\'s needed',
        'Improved code readability and maintainability'
      ]
    },
    quiz: [
      {
        id: 'q1',
        question: 'Why should unused variables be removed from code?',
        options: [
          'They make the code run slower',
          'They clutter the code and can confuse developers',
          'They cause syntax errors',
          'They are automatically deleted by the compiler'
        ],
        correctOptionIndex: 1,
        explanation: 'Unused variables clutter the codebase, make it harder to understand, and can mislead other developers about the code\'s intent.',
        difficulty: 'easy',
        concept: 'Code cleanliness'
      },
      {
        id: 'q2',
        question: 'What is the best practice when you find unused variables?',
        options: [
          'Leave them for future use',
          'Comment them out',
          'Remove them completely',
          'Rename them to "unused"'
        ],
        correctOptionIndex: 2,
        explanation: 'The best practice is to remove unused variables completely. If you need them later, version control systems can help you recover them.',
        difficulty: 'easy',
        concept: 'Code maintenance'
      }
    ],
    relatedResources: [
      {
        title: 'ESLint no-unused-vars Rule',
        url: 'https://eslint.org/docs/rules/no-unused-vars',
        type: 'documentation',
        description: 'Official ESLint documentation for detecting unused variables',
        difficulty: 'beginner'
      },
      {
        title: 'Clean Code Principles',
        url: 'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html',
        type: 'article',
        description: 'Learn about writing clean, maintainable code',
        difficulty: 'intermediate'
      }
    ],
    metadata: {
      issueType: 'unused-variable',
      generatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      timesShown: 0,
      completionRate: 0,
      averageScore: 0
    }
  },
  'missing-key-prop': {
    id: 'edu-react-key-001',
    title: 'React Keys: Why They Matter',
    description: 'Understand the importance of key props in React lists and how they affect performance and behavior.',
    conceptLevel: 'intermediate',
    category: 'React',
    examples: {
      before: {
        code: `function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li>{todo.text}</li>
      ))}
    </ul>
  );
}`,
        explanation: 'Missing key props can cause React to inefficiently re-render list items and lose component state.',
        language: 'jsx'
      },
      after: {
        code: `function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}`,
        explanation: 'With proper key props, React can efficiently track and update list items.',
        language: 'jsx'
      },
      keyChanges: [
        'Added unique key prop to each list item',
        'Used stable identifier (todo.id) as the key',
        'Improved React\'s reconciliation performance'
      ]
    },
    quiz: [
      {
        id: 'q1',
        question: 'What is the primary purpose of the key prop in React?',
        options: [
          'To style the component',
          'To help React identify which items have changed',
          'To pass data to child components',
          'To handle click events'
        ],
        correctOptionIndex: 1,
        explanation: 'The key prop helps React identify which items have changed, been added, or removed, enabling efficient updates.',
        difficulty: 'medium',
        concept: 'React reconciliation'
      },
      {
        id: 'q2',
        question: 'Which of these is the WORST choice for a React key?',
        options: [
          'A unique ID from your data',
          'Array index',
          'A UUID',
          'A stable hash of the item'
        ],
        correctOptionIndex: 1,
        explanation: 'Array index is the worst choice because it can change when items are reordered, causing React to lose track of component state.',
        difficulty: 'medium',
        concept: 'Key selection'
      }
    ],
    relatedResources: [
      {
        title: 'React Keys Documentation',
        url: 'https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key',
        type: 'documentation',
        description: 'Official React documentation on keys',
        difficulty: 'beginner'
      },
      {
        title: 'Why React Keys Matter',
        url: 'https://kentcdodds.com/blog/understanding-reacts-key-prop',
        type: 'article',
        description: 'Deep dive into React keys by Kent C. Dodds',
        difficulty: 'intermediate'
      }
    ],
    metadata: {
      issueType: 'missing-key-prop',
      generatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      timesShown: 0,
      completionRate: 0,
      averageScore: 0
    }
  },
  'inefficient-re-render': {
    id: 'edu-react-perf-001',
    title: 'Preventing Unnecessary Re-renders',
    description: 'Learn how to identify and prevent unnecessary re-renders in React components for better performance.',
    conceptLevel: 'advanced',
    category: 'Performance',
    examples: {
      before: {
        code: `function ExpensiveComponent({ data, onUpdate }) {
  const processedData = data.map(item => ({;
    ...item,
    processed: heavyCalculation(item)
  }));
  return (
    <div>
      {processedData.map(item => (
        <div key={item.id}>{item.processed}</div>
      ))}
    </div>
  );
}`,
        explanation: 'This component recalculates processed data on every render, even when data hasn\'t changed.',
        language: 'jsx'
      },
      after: {
        code: `function ExpensiveComponent({ data, onUpdate }) {
  const processedData = useMemo(() => ;
    data.map(item => ({
      ...item,
      processed: heavyCalculation(item)
    })), [data]
  );
  return (
    <div>
      {processedData.map(item => (
        <div key={item.id}>{item.processed}</div>
      ))}
    </div>
  );
}`,
        explanation: 'Using useMemo ensures the expensive calculation only runs when data actually changes.',
        language: 'jsx'
      },
      keyChanges: [
        'Wrapped expensive calculation in useMemo',
        'Added proper dependency array [data]',
        'Prevented unnecessary recalculations on re-renders'
      ]
    },
    quiz: [
      {
        id: 'q1',
        question: 'When should you use useMemo in React?',
        options: [
          'For every calculation in your component',
          'Only for expensive calculations that depend on specific values',
          'Never, it always makes things slower',
          'Only in class components'
        ],
        correctOptionIndex: 1,
        explanation: 'useMemo should be used for expensive calculations that depend on specific values. Overusing it can actually hurt performance.',
        difficulty: 'hard',
        concept: 'React optimization'
      }
    ],
    relatedResources: [
      {
        title: 'React useMemo Hook',
        url: 'https://react.dev/reference/react/useMemo',
        type: 'documentation',
        description: 'Official React documentation for useMemo',
        difficulty: 'intermediate'
      }
    ],
    metadata: {
      issueType: 'inefficient-re-render',
      generatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      timesShown: 0,
      completionRate: 0,
      averageScore: 0
    }
  }
};
// Function to get sample educational content for testing
export const getSampleEducationalContent = (issueType: string): EducationalModule | null => {;
  return sampleEducationalModules[issueType] || null;
};
// Function to simulate the educational content generation process
export const generateEducationalContent = async (issueType: string): Promise<EducationalModule | null> => {;
  // Simulate API delay;
  await new Promise(resolve => setTimeout(resolve, 500));
  return getSampleEducationalContent(issueType);
}; 

export default calculateTotal;