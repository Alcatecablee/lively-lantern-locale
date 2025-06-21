import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Lightbulb, Trophy } from 'lucide-react';
import { EducationalOverlay } from './EducationalOverlay';
import { EducationService } from '@/lib/education';
import { EducationalModule } from '@/types/education';
import { CodeIssue } from '@/types/analysis';

interface EducationalButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  issue: CodeIssue;
  className?: string;
}

export const EducationalButton: React.FC<EducationalButtonProps> = ({
  issue,
  className = ''
}) => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [educationalModule, setEducationalModule] = useState<EducationalModule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  useEffect(() => {
    checkEducationalContent();
  }, [issue.type]);
  const checkEducationalContent = async () => {
    try {
      const content = await EducationService.getEducationalContentForIssue(issue.type);
      setHasContent(content.hasContent);
      if (content.module) {
        setEducationalModule(content.module);
      }
    } catch (error) {
      console.error('Error checking educational content:', error);
      setHasContent(false);
    }
  };
  const handleLearnClick = async () => {
    if (!educationalModule) {
      setIsLoading(true);
      try {
        const content = await EducationService.getEducationalContentForIssue(issue.type);
        if (content.module) {
          setEducationalModule(content.module);
          setIsOverlayOpen(true);
        }
      } catch (error) {
        console.error('Error loading educational module:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsOverlayOpen(true);
    }
  };
  const handleComplete = (moduleId: string, score: number) => {
    // You could add celebration effects, notifications, etc.
    console.debug(`Module ${moduleId} completed with score: ${score}%`);
  };
  if (!hasContent) {
    return null; // Don't show button if no educational content available
  }
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLearnClick}
        disabled={isLoading}
        className={`flex items-center space-x-2 ${className}`}
      >
        <BookOpen className="h-4 w-4" />
        <span>{isLoading ? 'Loading...' : 'Learn'}</span>
        {educationalModule && (
          <Badge variant="secondary" className="ml-2">
            {educationalModule.conceptLevel}
          </Badge>
        )}
      </Button>
      {educationalModule && (
        <EducationalOverlay
          isOpen={isOverlayOpen}
          onClose={() => setIsOverlayOpen(false)}
          module={educationalModule}
          onComplete={handleComplete}
        />
      )}
    </>
  );
};
