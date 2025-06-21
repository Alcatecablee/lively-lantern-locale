import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ArrowRight, ArrowLeft, Target, Clock, HelpCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface InteractiveQuizProps {
  questions: Array<{
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
    difficulty: string;
    concept?: string;
  }>;
  onComplete: (correctAnswers: number, totalQuestions: number) => void;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({
  questions,
  onComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({});
  const [quizStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasAnsweredCurrent = selectedAnswers[currentQuestionIndex] !== undefined;
  const isCurrentCorrect = hasAnsweredCurrent && 
    selectedAnswers[currentQuestionIndex] === currentQuestion.correctOptionIndex;

  const handleAnswerSelect = (optionIndex: number) => {
    if (showFeedback[currentQuestionIndex]) return; // Prevent changing after feedback
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
    // Show feedback immediately
    setShowFeedback(prev => ({
      ...prev,
      [currentQuestionIndex]: true
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Calculate final score and complete quiz
      const correctAnswers = questions.reduce((count, question, index) => {
        return selectedAnswers[index] === question.correctOptionIndex ? count + 1 : count;
      }, 0);
      onComplete(correctAnswers, questions.length);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOptionStyle = (optionIndex: number) => {
    const isSelected = selectedAnswers[currentQuestionIndex] === optionIndex;
    const showingFeedback = showFeedback[currentQuestionIndex];
    const isCorrect = optionIndex === currentQuestion.correctOptionIndex;

    if (!showingFeedback) {
      return isSelected 
        ? 'border-blue-500 bg-blue-50 text-blue-900' 
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
    }

    if (isCorrect) {
      return 'border-green-500 bg-green-50 text-green-900';
    }

    if (isSelected && !isCorrect) {
      return 'border-red-500 bg-red-50 text-red-900';
    }

    return 'border-gray-200 bg-gray-50 text-gray-500';
  };

  const getOptionIcon = (optionIndex: number) => {
    const isSelected = selectedAnswers[currentQuestionIndex] === optionIndex;
    const showingFeedback = showFeedback[currentQuestionIndex];
    const isCorrect = optionIndex === currentQuestion.correctOptionIndex;

    if (!showingFeedback) {
      return null;
    }

    if (isCorrect) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }

    if (isSelected && !isCorrect) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }

    return null;
  };

  const calculateProgress = () => {
    const answeredQuestions = Object.keys(selectedAnswers).length;
    return (answeredQuestions / questions.length) * 100;
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Target className="h-6 w-6 text-blue-500" />
              <div>
                <CardTitle>Knowledge Check</CardTitle>
                <CardDescription>
                  <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                    {currentQuestion.difficulty}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatTime(Date.now() - quizStartTime)}
                  </div>
                </CardDescription>
              </div>
            </div>
          </div>
          <Progress value={calculateProgress()} className="w-full" />
        </CardHeader>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-start space-x-3">
            <HelpCircle className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
            <span className="leading-relaxed">{currentQuestion.question}</span>
          </CardTitle>
          {currentQuestion.concept && (
            <CardDescription>
              Testing: {currentQuestion.concept}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button aria-label="Button"
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={showFeedback[currentQuestionIndex]}
              className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 flex items-center justify-between ${getOptionStyle(index)}`}
            >
              <span className="flex-1">{option}</span>
              {getOptionIcon(index)}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Feedback Card */}
      {showFeedback[currentQuestionIndex] && (
        <Card className={isCurrentCorrect ? 'border-green-200' : 'border-red-200'}>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              {isCurrentCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className={`font-medium mb-2 ${isCurrentCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCurrentCorrect ? 'Correct!' : 'Not quite right.'}
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <div className="text-sm text-gray-500">
          {Object.keys(selectedAnswers).length} of {questions.length} answered
        </div>
        <Button
          variant="default"
          onClick={handleNext}
          disabled={!hasAnsweredCurrent}
          className="flex items-center"
        >
          {isLastQuestion ? 'Complete Quiz' : 'Next'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};