import React from 'react';
import { BlogPost } from '@/components/blog/BlogPost';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const BlogPostPage = () => {
  const handleGetStarted = () => {
    // Handle get started action
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onGetStarted={handleGetStarted} />
      <BlogPost />
      <Footer />
    </div>
  );
};

export default BlogPostPage;