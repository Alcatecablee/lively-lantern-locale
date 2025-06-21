import React from 'react';
import { BlogPage as BlogPageComponent } from '@/components/blog/BlogPage';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEOHead } from '@/components/seo/SEOHead';

const BlogPage = () => {
  const handleGetStarted = () => {
    // Handle get started action
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="NeuroLint Blog - React Development & Code Quality Insights"
        description="Expert insights on React development, TypeScript best practices, code quality, performance optimization, and modern web development techniques."
        keywords="react blog, typescript tutorials, code quality, javascript guides, web development, programming tips, react hooks, performance optimization"
        url="https://neurolint.com/blog"
      />
      <Header onGetStarted={handleGetStarted} />
      <BlogPageComponent />
      <Footer />
    </div>
  );
};

export default BlogPage;