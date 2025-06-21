import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, ArrowRight, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
const blogPosts = [
  {
    id: 'react-performance-optimization-2024',
    title: 'Complete Guide to React Performance Optimization in 2024',
    excerpt: 'Master advanced React performance techniques including memo, useMemo, useCallback, code splitting, and modern optimization patterns.',
    author: 'NeuroLint Team',
    date: '2024-12-07',
    readTime: '12 min read',
    category: 'Performance',
    tags: ['React', 'Performance', 'Optimization', 'JavaScript'],
    image: '/placeholder.svg'
  },
  {
    id: 'typescript-best-practices-enterprise',
    title: 'TypeScript Best Practices for Enterprise Applications',
    excerpt: 'Discover enterprise-grade TypeScript patterns, advanced types, strict configurations, and maintainable code architecture.',
    author: 'NeuroLint Team',
    date: '2024-12-06',
    readTime: '15 min read',
    category: 'TypeScript',
    tags: ['TypeScript', 'Enterprise', 'Best Practices', 'Architecture'],
    image: '/placeholder.svg'
  },
  {
    id: 'react-hooks-advanced-patterns',
    title: 'Advanced React Hooks Patterns and Custom Hook Development',
    excerpt: 'Deep dive into advanced React Hooks patterns, custom hooks creation, and state management strategies for complex applications.',
    author: 'NeuroLint Team',
    date: '2024-12-05',
    readTime: '18 min read',
    category: 'React Hooks',
    tags: ['React', 'Hooks', 'Custom Hooks', 'State Management'],
    image: '/placeholder.svg'
  },
  {
    id: 'code-quality-static-analysis',
    title: 'Code Quality and Static Analysis: Tools and Techniques',
    excerpt: 'Comprehensive guide to code quality metrics, static analysis tools, linting strategies, and automated code review processes.',
    author: 'NeuroLint Team',
    date: '2024-12-04',
    readTime: '14 min read',
    category: 'Code Quality',
    tags: ['Code Quality', 'Static Analysis', 'Linting', 'DevOps'],
    image: '/placeholder.svg'
  },
  {
    id: 'react-testing-comprehensive-guide',
    title: 'React Testing: Complete Guide to Unit, Integration & E2E Testing',
    excerpt: 'Master React testing with Jest, React Testing Library, Cypress, and testing strategies for reliable applications.',
    author: 'NeuroLint Team',
    date: '2024-12-03',
    readTime: '20 min read',
    category: 'Testing',
    tags: ['React', 'Testing', 'Jest', 'Cypress', 'Quality Assurance'],
    image: '/placeholder.svg'
  },
  {
    id: 'modern-javascript-features-2024',
    title: 'Modern JavaScript Features Every Developer Should Know in 2024',
    excerpt: 'Explore the latest JavaScript features, ES2024 updates, and how to leverage modern JS for better React development.',
    author: 'NeuroLint Team',
    date: '2024-12-02',
    readTime: '16 min read',
    category: 'JavaScript',
    tags: ['JavaScript', 'ES2024', 'Modern JS', 'Web Development'],
    image: '/placeholder.svg'
  }
];

export const BlogPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            NeuroLint Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Expert insights on React development, TypeScript best practices, code quality, and modern web development techniques.
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 border border-border">
              <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{post.category}</Badge>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{post.readTime}</span>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  <Link to={`/blog/${post.id}`}>
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                    <Calendar className="h-4 w-4 ml-2" />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild><Link to={`/blog/${post.id}`}>;
                      Read More <ArrowRight className="h-4 w-4 ml-1" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))};
        </div>
      </section>
    </div>
  );
};