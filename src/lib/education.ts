import { supabase } from '@/integrations/supabase/client';
import { CodeIssue } from "@/types/analysis";
import { 
  EducationalModule, 
  UserLearningProgress, 
  LearningAnalytics,
  CodeIssueWithEducation 
} from '@/types/education';

export class EducationService {
  /**
   * Get educational content for a specific code issue type
   */
  static async getEducationalContentForIssue(issueType: string): Promise<{
    hasContent: boolean;
    module?: EducationalModule;
    priority?: number;
  }> {
    try {
      const { data, error } = await supabase.rpc('get_educational_content_for_issue', {
        issue_type_param: issueType
      });
      if (error) {
        console.error('Error fetching educational content:', error);
        return { hasContent: false };
      }
      if (!data || data.length === 0) {
        return { hasContent: false };
      }
      const result = data[0];
      if (!result.has_content || !result.module_id) {
        return { hasContent: false };
      }
      // Fetch the full module details
      const { data: moduleData, error: moduleError } = await supabase
        .from('educational_modules')
        .select('*')
        .eq('id', result.module_id)
        .eq('is_active', true)
        .single();
      if (moduleError || !moduleData) {
        console.error('Error fetching module details:', moduleError);
        return { hasContent: false };
      }
      return {
        hasContent: true,
        module: moduleData as EducationalModule,
        priority: result.learning_priority || 5
      };
    } catch (error) {
      console.error('Error in getEducationalContentForIssue:', error);
      return { hasContent: false };
    }
  }
  /**
   * Enhance code issues with educational metadata
   */
  static async enhanceIssuesWithEducation(issues: CodeIssue[]): Promise<(CodeIssue & CodeIssueWithEducation)[]> {
    const enhancedIssues: (CodeIssue & CodeIssueWithEducation)[] = [];
    for (const issue of issues) {
      const educationalContent = await this.getEducationalContentForIssue(issue.type);
      enhancedIssues.push({
        ...issue,
        hasEducationalContent: educationalContent.hasContent,
        educationalModuleId: educationalContent.module?.id,
        conceptName: educationalContent.module?.category,
        difficulty: educationalContent.module?.conceptLevel as 'beginner' | 'intermediate' | 'advanced',
        learningPriority: educationalContent.priority
      });
    }
    return enhancedIssues;
  }
  /**
   * Track learning event for analytics
   */
  static async trackLearningEvent(
    userId: string,
    moduleId: string,
    event: 'module_started' | 'quiz_attempted' | 'module_completed' | 'concept_mastered',
    metadata: Record<string, any> = {},
    sessionId?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('track_learning_event', {
        p_user_id: userId,
        p_module_id: moduleId,
        p_event: event,
        p_metadata: metadata,
        p_session_id: sessionId
      });
      if (error) {
        console.error('Error tracking learning event:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in trackLearningEvent:', error);
      return false;
    }
  }
  /**
   * Get user's learning progress for a specific module
   */
  static async getUserProgress(userId: string, moduleId: string): Promise<UserLearningProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_learning_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .single();
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching user progress:', error);
        return null;
      }
      return data as UserLearningProgress;
    } catch (error) {
      console.error('Error in getUserProgress:', error);
      return null;
    }
  }
  /**
   * Update user's learning progress
   */
  static async updateUserProgress(
    userId: string,
    moduleId: string,
    updates: Partial<UserLearningProgress>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_learning_progress')
        .upsert({
          user_id: userId,
          module_id: moduleId,
          ...updates,
          last_accessed: new Date().toISOString()
        });
      if (error) {
        console.error('Error updating user progress:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in updateUserProgress:', error);
      return false;
    }
  }
  /**
   * Get all educational modules for a category
   */
  static async getModulesByCategory(category: string): Promise<EducationalModule[]> {
    try {
      const { data, error } = await supabase
        .from('educational_modules')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching modules by category:', error);
        return [];
      }
      return data as EducationalModule[];
    } catch (error) {
      console.error('Error in getModulesByCategory:', error);
      return [];
    }
  }
  /**
   * Get user's overall learning analytics
   */
  static async getUserLearningAnalytics(userId: string, limit: number = 50): Promise<LearningAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('learning_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) {
        console.error('Error fetching learning analytics:', error);
        return [];
      }
      return data as LearningAnalytics[];
    } catch (error) {
      console.error('Error in getUserLearningAnalytics:', error);
      return [];
    }
  }
  /**
   * Check if educational system is available
   */
  static async isEducationalSystemAvailable(): Promise<boolean> {
    try {
      // Simple health check by trying to fetch one educational module
      const { data, error } = await supabase
        .from('educational_modules')
        .select('id')
        .eq('is_active', true)
        .limit(1);
      return !error && data !== null;
    } catch (error) {
      console.error('Educational system health check failed:', error);
      return false;
    }
  }
}
