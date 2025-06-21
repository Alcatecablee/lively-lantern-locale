-- Add realistic educational modules for common React/TypeScript issues
-- Run this in your Supabase SQL editor to add real educational content

-- 1. Unused Variables Module
INSERT INTO educational_modules (
  title,
  description,
  concept_level,
  category,
  issue_type,
  examples,
  quiz,
  related_resources,
  is_active
) VALUES (
  'Eliminating Dead Code: Unused Variables',
  'Learn industry best practices for maintaining clean codebases by identifying and removing unused variables, imports, and functions.',
  'beginner',
  'Code Quality',
  'unused-variable',
  '{
    "before": {
      "code": "import React, { useState, useEffect, useCallback } from ''react'';\nimport { debounce } from ''lodash'';\nimport { formatDate } from ''../utils/date'';\n\nfunction UserProfile({ userId }) {\n  const [user, setUser] = useState(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n  const unusedVariable = ''This serves no purpose'';\n  const anotherUnused = 42;\n  \n  useEffect(() => {\n    fetchUser(userId).then(setUser).finally(() => setLoading(false));\n  }, [userId]);\n  \n  return loading ? <div>Loading...</div> : <div>{user?.name}</div>;\n}",
      "explanation": "This component has unused imports (useCallback, debounce, formatDate) and unused variables that clutter the code and increase bundle size.",
      "language": "jsx"
    },
    "after": {
      "code": "import React, { useState, useEffect } from ''react'';\n\nfunction UserProfile({ userId }) {\n  const [user, setUser] = useState(null);\n  const [loading, setLoading] = useState(true);\n  \n  useEffect(() => {\n    fetchUser(userId).then(setUser).finally(() => setLoading(false));\n  }, [userId]);\n  \n  return loading ? <div>Loading...</div> : <div>{user?.name}</div>;\n}",
      "explanation": "Clean code with only necessary imports and variables, reducing bundle size and improving maintainability.",
      "language": "jsx"
    },
    "keyChanges": [
      "Removed unused React hooks (useCallback)",
      "Removed unused library imports (lodash debounce)",
      "Removed unused utility imports (formatDate)",
      "Eliminated dead variables that served no purpose",
      "Reduced bundle size and improved code clarity"
    ]
  }',
  '[
    {
      "id": "q1",
      "question": "What are the main benefits of removing unused variables and imports?",
      "options": [
        "Faster compilation only",
        "Smaller bundle size, better performance, and improved code readability",
        "Better TypeScript support",
        "Automatic bug fixes"
      ],
      "correctOptionIndex": 1,
      "explanation": "Removing unused code reduces bundle size (better performance), makes code more readable for developers, and eliminates confusion about code intent.",
      "difficulty": "easy",
      "concept": "Code optimization"
    },
    {
      "id": "q2",
      "question": "Which tool can automatically detect unused variables in React projects?",
      "options": [
        "Prettier",
        "ESLint with no-unused-vars rule",
        "Babel",
        "Webpack"
      ],
      "correctOptionIndex": 1,
      "explanation": "ESLint with the no-unused-vars rule can automatically detect and even fix unused variables, imports, and functions.",
      "difficulty": "medium",
      "concept": "Development tools"
    }
  ]',
  '[
    {
      "title": "ESLint no-unused-vars Documentation",
      "url": "https://eslint.org/docs/rules/no-unused-vars",
      "type": "documentation",
      "description": "Official ESLint rule for detecting unused variables",
      "difficulty": "beginner"
    },
    {
      "title": "Tree Shaking in Modern JavaScript",
      "url": "https://webpack.js.org/guides/tree-shaking/",
      "type": "guide",
      "description": "Learn how bundlers eliminate dead code",
      "difficulty": "intermediate"
    }
  ]',
  true
);

-- 2. React Keys Module
INSERT INTO educational_modules (
  title,
  description,
  concept_level,
  category,
  issue_type,
  examples,
  quiz,
  related_resources,
  is_active
) VALUES (
  'React Keys: Performance and State Management',
  'Master React''s reconciliation algorithm and learn how proper key usage prevents bugs and optimizes rendering performance in production applications.',
  'intermediate',
  'React Performance',
  'missing-key-prop',
  '{
    "before": {
      "code": "function TodoList({ todos, onToggle, onDelete }) {\n  return (\n    <ul className=\"todo-list\">\n      {todos.map((todo, index) => (\n        <li className={todo.completed ? \"completed\" : \"\"}>\n          <input\n            type=\"checkbox\"\n            checked={todo.completed}\n            onChange={() => onToggle(todo.id)}\n          />\n          <span>{todo.text}</span>\n          <button onClick={() => onDelete(todo.id)}>Delete</button>\n        </li>\n      ))}\n    </ul>\n  );\n}",
      "explanation": "Without keys, React cannot efficiently track list items during reordering, causing unnecessary re-renders and potential state loss.",
      "language": "jsx"
    },
    "after": {
      "code": "function TodoList({ todos, onToggle, onDelete }) {\n  return (\n    <ul className=\"todo-list\">\n      {todos.map((todo) => (\n        <li key={todo.id} className={todo.completed ? \"completed\" : \"\"}>\n          <input\n            type=\"checkbox\"\n            checked={todo.completed}\n            onChange={() => onToggle(todo.id)}\n          />\n          <span>{todo.text}</span>\n          <button onClick={() => onDelete(todo.id)}>Delete</button>\n        </li>\n      ))}\n    </ul>\n  );\n}",
      "explanation": "Using stable, unique keys allows React to efficiently update only changed items and preserve component state during reordering.",
      "language": "jsx"
    },
    "keyChanges": [
      "Added unique key prop using todo.id",
      "Removed array index dependency",
      "Enabled efficient React reconciliation",
      "Prevented component state loss during reordering",
      "Improved rendering performance for large lists"
    ]
  }',
  '[
    {
      "id": "q1",
      "question": "Why should you avoid using array index as a React key?",
      "options": [
        "It causes syntax errors",
        "It breaks React hooks",
        "It can cause state loss and performance issues when items are reordered",
        "It only works in development mode"
      ],
      "correctOptionIndex": 2,
      "explanation": "Array indices change when items are reordered, causing React to lose track of component state and unnecessarily re-render components.",
      "difficulty": "medium",
      "concept": "React reconciliation"
    },
    {
      "id": "q2",
      "question": "What makes a good React key?",
      "options": [
        "Any random number",
        "Array index",
        "A stable, unique identifier from your data",
        "The component name"
      ],
      "correctOptionIndex": 2,
      "explanation": "Good keys are stable (don''t change between renders) and unique (different for each item), typically using IDs from your data.",
      "difficulty": "medium",
      "concept": "Key selection"
    }
  ]',
  '[
    {
      "title": "React Keys Deep Dive",
      "url": "https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key",
      "type": "documentation",
      "description": "Official React documentation on keys and reconciliation",
      "difficulty": "intermediate"
    },
    {
      "title": "React Reconciliation Algorithm",
      "url": "https://react.dev/learn/preserving-and-resetting-state",
      "type": "guide",
      "description": "Understanding how React updates the DOM efficiently",
      "difficulty": "advanced"
    }
  ]',
  true
);

-- 3. Performance Optimization Module
INSERT INTO educational_modules (
  title,
  description,
  concept_level,
  category,
  issue_type,
  examples,
  quiz,
  related_resources,
  is_active
) VALUES (
  'React Performance: Memoization Strategies',
  'Learn when and how to use React.memo, useMemo, and useCallback to optimize component performance in real-world applications.',
  'advanced',
  'Performance Optimization',
  'inefficient-re-render',
  '{
    "before": {
      "code": "function ExpensiveDataTable({ data, filters, sortBy }) {\n  // Expensive calculation runs on every render\n  const processedData = data\n    .filter(item => {\n      return Object.keys(filters).every(key => \n        item[key]?.toString().toLowerCase().includes(filters[key].toLowerCase())\n      );\n    })\n    .sort((a, b) => {\n      if (sortBy.direction === ''asc'') {\n        return a[sortBy.field] > b[sortBy.field] ? 1 : -1;\n      }\n      return a[sortBy.field] < b[sortBy.field] ? 1 : -1;\n    })\n    .map(item => ({\n      ...item,\n      formattedDate: new Date(item.date).toLocaleDateString(),\n      calculatedValue: item.value * 1.2 + Math.random() * 100\n    }));\n\n  return (\n    <table>\n      <tbody>\n        {processedData.map(row => (\n          <tr key={row.id}>\n            <td>{row.name}</td>\n            <td>{row.formattedDate}</td>\n            <td>{row.calculatedValue.toFixed(2)}</td>\n          </tr>\n        ))}\n      </tbody>\n    </table>\n  );\n}",
      "explanation": "This component recalculates expensive data processing on every render, even when props haven''t changed, causing performance issues.",
      "language": "jsx"
    },
    "after": {
      "code": "import React, { useMemo } from ''react'';\n\nfunction ExpensiveDataTable({ data, filters, sortBy }) {\n  // Memoized expensive calculation\n  const processedData = useMemo(() => {\n    return data\n      .filter(item => {\n        return Object.keys(filters).every(key => \n          item[key]?.toString().toLowerCase().includes(filters[key].toLowerCase())\n        );\n      })\n      .sort((a, b) => {\n        if (sortBy.direction === ''asc'') {\n          return a[sortBy.field] > b[sortBy.field] ? 1 : -1;\n        }\n        return a[sortBy.field] < b[sortBy.field] ? 1 : -1;\n      })\n      .map(item => ({\n        ...item,\n        formattedDate: new Date(item.date).toLocaleDateString(),\n        calculatedValue: item.value * 1.2 + Math.random() * 100\n      }));\n  }, [data, filters, sortBy]); // Only recalculate when dependencies change\n\n  return (\n    <table>\n      <tbody>\n        {processedData.map(row => (\n          <tr key={row.id}>\n            <td>{row.name}</td>\n            <td>{row.formattedDate}</td>\n            <td>{row.calculatedValue.toFixed(2)}</td>\n          </tr>\n        ))}\n      </tbody>\n    </table>\n  );\n}",
      "explanation": "Using useMemo ensures expensive calculations only run when dependencies change, dramatically improving performance.",
      "language": "jsx"
    },
    "keyChanges": [
      "Wrapped expensive calculation in useMemo",
      "Added proper dependency array [data, filters, sortBy]",
      "Prevented unnecessary recalculations on unrelated re-renders",
      "Improved performance for large datasets",
      "Maintained referential equality for child components"
    ]
  }',
  '[
    {
      "id": "q1",
      "question": "When should you use useMemo in React?",
      "options": [
        "For every calculation in your component",
        "Only for expensive calculations with stable dependencies",
        "Never, it always hurts performance",
        "Only in class components"
      ],
      "correctOptionIndex": 1,
      "explanation": "useMemo should be used for expensive calculations that depend on specific values. Overusing it can hurt performance due to the overhead of dependency checking.",
      "difficulty": "hard",
      "concept": "Performance optimization"
    },
    {
      "id": "q2",
      "question": "What happens if you omit the dependency array in useMemo?",
      "options": [
        "The calculation runs on every render",
        "The calculation never runs",
        "React throws an error",
        "The calculation runs only once"
      ],
      "correctOptionIndex": 0,
      "explanation": "Without a dependency array, useMemo will run the calculation on every render, defeating its purpose of optimization.",
      "difficulty": "medium",
      "concept": "React hooks"
    }
  ]',
  '[
    {
      "title": "React useMemo Hook",
      "url": "https://react.dev/reference/react/useMemo",
      "type": "documentation",
      "description": "Official React documentation for useMemo",
      "difficulty": "intermediate"
    },
    {
      "title": "React Performance Optimization Guide",
      "url": "https://react.dev/learn/render-and-commit#optimizing-performance",
      "type": "guide",
      "description": "Comprehensive guide to React performance optimization",
      "difficulty": "advanced"
    }
  ]',
  true
);

-- Now we need to get the generated UUIDs and link them to issue types
-- First, let's create a temporary function to help with the mapping
DO $$
DECLARE
    unused_var_id UUID;
    react_keys_id UUID;
    perf_opt_id UUID;
BEGIN
    -- Get the UUIDs of the modules we just inserted
    SELECT id INTO unused_var_id FROM educational_modules WHERE issue_type = 'unused-variable' LIMIT 1;
    SELECT id INTO react_keys_id FROM educational_modules WHERE issue_type = 'missing-key-prop' LIMIT 1;
    SELECT id INTO perf_opt_id FROM educational_modules WHERE issue_type = 'inefficient-re-render' LIMIT 1;
    
    -- Link educational modules to issue types
    INSERT INTO code_issue_education_mapping (issue_type, module_id, has_educational_content, learning_priority, is_active)
    VALUES 
      ('unused-variable', unused_var_id, true, 8, true),
      ('missing-key-prop', react_keys_id, true, 9, true),
      ('inefficient-re-render', perf_opt_id, true, 7, true);
END $$; 