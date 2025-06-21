import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Senior React Developer",
    company: "TechFlow Inc",
    content: "NeuroLint caught performance issues in our React app that we completely missed during code review. The automated fixes saved us hours of debugging.",
    rating: 5,
    avatar: "SC"
  },
  {
    name: "Marcus Rodriguez",
    role: "Tech Lead",
    company: "StartupXYZ",
    content: "The accessibility analysis is incredible. It helped us meet WCAG compliance requirements and improved our app's usability for all users.",
    rating: 5,
    avatar: "MR"
  },
  {
    name: "Emily Wang",
    role: "Frontend Architect",
    company: "Enterprise Corp",
    content: "Best investment for our development workflow. The code quality insights and automatic fixes have significantly reduced our technical debt.",
    rating: 5,
    avatar: "EW"
  },
  {
    name: "David Kim",
    role: "Full Stack Developer",
    company: "DevStudio",
    content: "Love how it integrates with our CI/CD pipeline. The API makes it easy to run automated checks on every pull request.",
    rating: 5,
    avatar: "DK"
  }
];

export const Testimonials: React.FC = () => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-cursor-text-muted'
        }`}
      />
    ));
  };

  return (
    <section className="py-24 px-4 bg-cursor-bg relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cursor-accent-purple/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cursor-accent-blue/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-cursor-surface border border-cursor-border rounded-full mb-4">
            <span className="text-sm font-medium text-cursor-text-secondary">Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-cursor-text-primary mb-6 tracking-tight">
            Trusted by developers worldwide
          </h2>
          <p className="text-lg sm:text-xl text-cursor-text-secondary max-w-3xl mx-auto font-medium">
            See what developers are saying about NeuroLint and how it's transforming their code quality.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card-cursor-hover p-8 relative overflow-hidden group">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-cursor-accent-blue/10 to-cursor-accent-purple/10 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>

              <div className="relative z-10">
                <div className="flex items-start gap-4">
                  <Quote className="w-8 h-8 text-cursor-accent-blue opacity-60 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-cursor-text-primary mb-6 text-lg leading-relaxed">
                      "{testimonial.content}"
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-cursor-accent-blue/20 border border-cursor-accent-blue/30 rounded-full flex items-center justify-center">
                          <span className="text-cursor-accent-blue font-semibold">
                            {testimonial.avatar}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-cursor-text-primary">
                            {testimonial.name}
                          </div>
                          <div className="text-sm text-cursor-text-secondary">
                            {testimonial.role} at {testimonial.company}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};