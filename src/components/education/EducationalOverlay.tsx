import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EducationalModule, QuizQuestion, UserLearningProgress } from "@/types/education";
import { CodeExample } from './CodeExample';
import { InteractiveQuiz } from './InteractiveQuiz';
import { EducationService } from '@/lib/education';
import { useAuth } from '@/hooks/useAuth';
import { 
  BookOpen, 
  Code, 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  ArrowRight, 
  Trophy,
  Clock,
  Target
} from 'lucide-react';

interface EducationalOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  module: EducationalModule;
  onComplete?: (moduleId: string, score: number) => void;
}

export const EducationalOverlay: React.FC<EducationalOverlayProps> = ({
  isOpen,
  onClose,
  module,
  onComplete
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('learn');
  const [progress, setProgress] = useState<UserLearningProgress | null>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  useEffect(() => {
    if (user && module && isOpen) {
      loadUserProgress();
      trackModuleStart();
    }
  }, [user, module, isOpen]);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen) {
      interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, startTime]);
  const loadUserProgress = async () => {
    if (!user || !module) return;
    const userProgress = await EducationService.getUserProgress(user.id, module.id);
    setProgress(userProgress);
    setIsCompleted(userProgress?.status === 'completed');
  };
  const trackModuleStart = async () => {
    if (!user || !module) return;
    await EducationService.trackLearningEvent(
      user.id,
      module.id,
      'module_started',
      {
        conceptLevel: module.conceptLevel,
        category: module.category
      }
    );
  };
  const handleQuizComplete = async (score: number, totalQuestions: number) => {
    setQuizScore(score);
    if (!user || !module) return;
    const percentage = (score / totalQuestions) * 100;
    const passed = percentage >= 70; // 70% passing grade
    await EducationService.trackLearningEvent(
      user.id,
      module.id,
      'quiz_attempted',
      {
        score: percentage,
        timeSpent,
        passed
      }
    );
    if (passed) {
      setIsCompleted(true);
      await EducationService.updateUserProgress(user.id, module.id, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        timeSpent
      });
      await EducationService.trackLearningEvent(
        user.id,
        module.id,
        'module_completed',
        {
          finalScore: percentage,
          totalTimeSpent: timeSpent
        }
      );
      onComplete?.(module.id, percentage);
    }
  };
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-6 w-6 text-blue-500" />
              <div>
                <DialogTitle className="text-xl font-bold">{module.title}</DialogTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getDifficultyColor(module.conceptLevel)}>
                    {module.conceptLevel}
                  </Badge>
                  <Badge variant="outline">{module.category}</Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatTime(timeSpent)}
                  </div>
                </div>
              </div>
            </div>
            {isCompleted && (
              <div className="flex items-center text-green-600">
                <Trophy className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">Completed!</span>
              </div>
            )}
          </div>
        </DialogHeader>
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="learn" className="flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Learn
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center">
              <Code className="h-4 w-4 mr-2" />
              Practice
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Quiz
            </TabsTrigger>
          </TabsList>
          <TabsContent value="learn" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Understanding the Concept</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {module.description}
                  </p>
                </div>
              </CardContent>
            </Card>
            {module.relatedResources && module.relatedResources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {module.relatedResources.map((resource, index) => (
                      <div key={index} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{resource.title}</h4>
                          <p className="text-xs text-gray-500">{resource.description}</p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <ArrowRight className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="practice" className="space-y-6">
            <CodeExample 
              example={module.examples}
              onUnderstand={() => setCurrentTab('quiz')}
            />
          </TabsContent>
          <TabsContent value="quiz" className="space-y-6">
            {quizScore !== null ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {quizScore >= module.quiz.length * 0.7 ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    Quiz Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-3xl font-bold">
                      {Math.round((quizScore / module.quiz.length) * 100)}%
                    </div>
                    <Progress 
                      value={(quizScore / module.quiz.length) * 100} 
                      className="w-full"
                    />
                    <p className="text-gray-600">
                      You got {quizScore} out of {module.quiz.length} questions correct!
                    </p>
                    {quizScore >= module.quiz.length * 0.7 ? (
                      <div className="text-green-600 font-medium">
                        🎉 Congratulations! You've mastered this concept!
                      </div>
                    ) : (
                      <div className="text-orange-600">
                        Keep practicing! Review the material and try again.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <InteractiveQuiz 
                questions={module.quiz}
                onComplete={handleQuizComplete}
              />
            )}
          </TabsContent>
        </Tabs>
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            Progress: {currentTab === 'learn' ? '33%' : currentTab === 'practice' ? '66%' : '100%'}
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              {isCompleted ? 'Close' : 'Continue Later'}
            </Button>
            {currentTab === 'learn' && (
              <Button variant="default" onClick={() => setCurrentTab('practice')}>
                Start Practice <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {currentTab === 'practice' && (
              <Button variant="default" onClick={() => setCurrentTab('quiz')}>
                Take Quiz <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 