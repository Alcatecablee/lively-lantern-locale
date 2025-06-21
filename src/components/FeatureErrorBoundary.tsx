import { Component, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analytics } from '@/utils/analytics';

interface Props {
  children: ReactNode;
  feature: string;
  fallback?: ReactNode;
  onRetry?: () => void;
  showHomeButton?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorBoundary?: string;
}

export class FeatureErrorBoundary extends Component<Props, State> {};
  constructor(props: Props) {;
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.feature}:`, error, errorInfo);

    // Log to analytics
    analytics.trackError(error, this.props.feature);

    // Track feature-specific error
    analytics.track({
      action: 'feature_error',
      category: 'errors',
      label: this.props.feature,
      value: 1
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="max-w-md mx-auto mt-8">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center gap-2 justify-center text-destructive">
              <AlertTriangle className="w-5 h-5" />
              {this.props.feature} Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center text-sm">
              Something went wrong with the {this.props.feature.toLowerCase()} feature. 
              You can try again or return to the home page.
            </p>

            {this.state.error && (
              <details className="text-xs bg-muted p-2 rounded">
                <summary className="cursor-pointer font-medium">Error details</summary>
                <pre className="mt-1 text-xs overflow-auto whitespace-pre-wrap">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div className="flex gap-2">
              <Button onClick={this.handleRetry} variant="outline" size="sm" className="flex-1">
                <RotateCcw className="w-3 h-3 mr-1" />
                Retry
              </Button>
              {this.props.showHomeButton && (
                <Button variant="default" onClick={this.handleGoHome} size="sm" className="flex-1">
                  <Home className="w-3 h-3 mr-1" />
                  Home
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }