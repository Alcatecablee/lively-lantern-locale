/// <reference path="../types/gtag.d.ts" />

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

export class Analytics {
  private static instance: Analytics;
  private isEnabled = false;

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  init(trackingId?: string) {
    if (typeof window === 'undefined') return;

    // Check if Google Analytics is available
    if (typeof window.gtag !== 'undefined' || trackingId) {
      this.isEnabled = true;
      console.debug('Analytics initialized');
    }
  }

  track(event: AnalyticsEvent) {
    if (!this.isEnabled) return;

    try {
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', event.action, {
          event_category: event.category,
          event_label: event.label,
          value: event.value
        });
      }

      console.debug('Analytics event:', event);
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  trackPageView(path: string) {
    if (!this.isEnabled) return;

    try {
      if (typeof window.gtag !== 'undefined') {
        window.gtag('config', 'GA_TRACKING_ID', {
          page_path: path
        });
      }
    } catch (error) {
      console.warn('Page view tracking failed:', error);
    }
  }

  trackUserAction(action: string, details?: Record<string, any>) {
    this.track({
      action,
      category: 'user_interaction',
      label: JSON.stringify(details)
    });
  }

  trackError(error: Error, context?: string) {
    this.track({
      action: 'error',
      category: 'errors',
      label: `${context || 'unknown'}: ${error.message}`
    });
  }

  trackFeatureUsage(feature: string, details?: Record<string, any>) {
    this.track({
      action: 'feature_used',
      category: 'features',
      label: feature,
      value: details?.count || 1
    });
  }
}

export const analytics = Analytics.getInstance();

// Predefined tracking functions
export const trackAnalysisStarted = (fileCount: number) => {
  analytics.trackFeatureUsage('code_analysis', { fileCount });
};

export const trackAnalysisCompleted = (issueCount: number, duration: number) => {
  analytics.track({
    action: 'analysis_completed',
    category: 'features',
    label: `${issueCount} issues found`,
    value: duration
  });
};

export const trackSignup = (method: 'email' | 'google') => {
  analytics.track({
    action: 'signup',
    category: 'user_lifecycle',
    label: method
  });
};

export const trackPayment = (plan: string, amount: number) => {
  analytics.track({
    action: 'payment_completed',
    category: 'revenue',
    label: plan,
    value: amount
  });
};

export const trackFixApplied = (fixType: string, success: boolean) => {
  analytics.track({
    action: 'fix_applied',
    category: 'features',
    label: fixType,
    value: success ? 1 : 0
  });
};

export const trackError = (error: string, context: string) => {
  analytics.track({
    action: 'error_occurred',
    category: 'errors',
    label: error,
    value: 1
  });
};
