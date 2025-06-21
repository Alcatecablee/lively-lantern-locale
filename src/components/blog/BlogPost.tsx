import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface BlogPostProps {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  publishedAt: Date;
  readingTime: string;
  tags: string[];
  slug: string;
  isPreview?: boolean;
}

export const BlogPost: React.FC<BlogPostProps> = ({
  title,
  excerpt,
  content,
  author,
  publishedAt,
  readingTime,
  tags,
  slug,
  isPreview = false
}) => {
  return (
    <article className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-colors">
      <header className="mb-4">
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={author.avatar}
            alt={author.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="text-white font-medium">{author.name}</p>
            <div className="flex items-center text-sm text-gray-400">
              <time dateTime={publishedAt.toISOString()}>
                {format(publishedAt, 'MMMM d, yyyy')}
              </time>
              <span className="mx-2">·</span>
              <span>{readingTime}</span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          {isPreview ? (
            <Link to={`/blog/${slug}`} className="hover:text-blue-400 transition-colors">
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      {isPreview ? (
        <>
          <p className="text-gray-300 mb-4">{excerpt}</p>
          <Link
            to={`/blog/${slug}`}
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            Read more
            <svg
              className="ml-2 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </>
      ) : (
        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </article>
  );
};