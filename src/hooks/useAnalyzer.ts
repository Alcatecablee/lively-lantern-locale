import { useState } from 'react';
import { ProjectAnalysis, CodeIssue } from '@/types/analysis';
import { ReactCodeAnalyzer } from '@/utils/analyzer/ReactCodeAnalyzer';
import { AutoFixer } from '@/utils/analyzer/autoFixer';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useAnalyzer = () => {
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fixedFiles, setFixedFiles] = useState<Map<string, string>>(new Map());
  const { toast } = useToast();
  const { user } = useAuth();
  const { incrementAnalysisCount, canPerformAnalysis, getRemainingAnalyses } = useSubscription();

  const analyzer = new ReactCodeAnalyzer();

  const applyAutoFix = (fileName: string, content: string, issue: CodeIssue): string => {
    console.debug(`🔧 Applying autofix for issue ${issue.id} (${issue.type}) in ${fileName}`);
    console.debug(`🔧 Original content length: ${content.length}`);
    console.debug(`🔧 Issue message: ${issue.message}`);

    try {
      // Use the AutoFixer class for most fixes
      let fixedContent = AutoFixer.applyFix(fileName, content, issue);

      // If AutoFixer didn't make changes, try specific pattern-based fixes
      if (fixedContent === content) {
        console.debug(`🔧 AutoFixer didn't fix, trying pattern-based fixes for type: ${issue.type}`);
        fixedContent = applyPatternBasedFix(content, issue);
      }

      if (fixedContent !== content) {
        console.debug(`🔧 Fix applied successfully! Content changed from ${content.length} to ${fixedContent.length} chars`);
      } else {
        console.debug(`🔧 No changes made for issue ${issue.id}`);
      }

      return fixedContent;
    } catch (error) {
      console.error(`🔧 Error applying fix for issue ${issue.id}:`, error);
      return content;
    }
  };

  const applyPatternBasedFix = (content: string, issue: CodeIssue): string => {
    // Handle specific patterns that might not be covered by AutoFixer
    switch (issue.type) {
      case 'console-statements':
        return fixConsoleStatements(content, issue);
      case 'var-usage':
        return fixVarUsage(content, issue);
      case 'missing-alt-text':
        return fixMissingAltText(content, issue);
      case 'missing-aria-label':
      case 'missing-aria-role':
        return fixAriaAttributes(content, issue);
      case 'missing-key-prop':
        return fixMissingKeyProp(content, issue);
      case 'missing-effect-dependencies':
        return fixUseEffectDependencies(content, issue);
      case 'typescript-any-type':
        return fixTypescriptAnyType(content, issue);
      case 'deprecated-lifecycle':
        return fixDeprecatedLifecycle(content, issue);
      default:
        return content;
    }
  };

  const fixConsoleStatements = (content: string, issue: CodeIssue): string => {
    if (issue.message.includes('console.log')) {
      return content.replace(/console\.log\(/g, 'console.debug(');
    }
    // Remove console statements
    const lines = content.split('\n');
    if (issue.line && issue.line <= lines.length) {
      const lineIndex = issue.line - 1;
      const line = lines[lineIndex];
      if (line.includes('console.')) {
        if (line.trim().match(/^\s*console\.\w+\([^)]*\);?\s*$/)) {
          lines.splice(lineIndex, 1);
        } else {
          lines[lineIndex] = line.replace(/console\.\w+\([^)]*\);\s*/g, '');
        }
        return lines.join('\n');
      }
    }
    return content.replace(/^\s*console\.\w+\([^)]*\);\s*$/gm, '');
  };

  const fixVarUsage = (content: string, issue: CodeIssue): string => {
    return content.replace(/\bvar\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*([^;]+);/g, (match, varName, value) => {
      if (value.trim().match(/^[\d"'`true|false|null|undefined]/)) {
        return `const ${varName} = ${value};`;
      }
      return `let ${varName} = ${value};`;
    });
  };

  const fixMissingAltText = (content: string, issue: CodeIssue): string => {
    return content.replace(/<img\b[^>]*>/g, (tag) => {
      if (tag.includes('alt=')) return tag;
      const closing = tag.endsWith('/>') ? '/>' : '>';
      const tagWithoutClosing = tag.slice(0, tag.length - closing.length);
      return `${tagWithoutClosing} alt="Image"${closing}`;
    });
  };

  const fixAriaAttributes = (content: string, issue: CodeIssue): string => {
    return content.replace(/<(button|div|span)(\s[^>]*?)(onClick[^>]*?)>/g, (match, tag, beforeAttrs, onClickAndAfter) => {
      if (!beforeAttrs.includes('aria-label=')) {
        return `<${tag}${beforeAttrs} aria-label="Interactive element" ${onClickAndAfter}>`;
      }
      return match;
    });
  };

  const fixMissingKeyProp = (content: string, issue: CodeIssue): string => {
    return content.replace(/\.map\(([^)]*?)\s*=>\s*<([^>]*?)>/g, (match, mapParam, jsxTag) => {
      if (!jsxTag.includes('key=')) {
        const paramName = mapParam.split(',')[0].trim().replace(/[()]/g, '');
        return match.replace(`<${jsxTag}>`, `<${jsxTag} key={${paramName}.id || index}>`);
      }
      return match;
    });
  };

  const fixUseEffectDependencies = (content: string, issue: CodeIssue): string => {
    return content.replace(/useEffect\(([^,]+)\)/g, 'useEffect($1, [])');
  };

  const fixTypescriptAnyType = (content: string, issue: CodeIssue): string => {
    return content.replace(/:\s*any\b/g, ': unknown');
  };

  const fixDeprecatedLifecycle = (content: string, issue: CodeIssue): string => {
    return content
      .replace(/componentWillMount/g, 'componentDidMount')
      .replace(/componentWillReceiveProps/g, 'componentDidUpdate')
      .replace(/componentWillUpdate/g, 'componentDidUpdate');
  };

  const handleFilesSelected = async (files: File[]) => {
    console.debug('🔍 handleFilesSelected called with files:', files.map(f => f.name));

    if (!user) {
      console.debug('❌ No user found');
      toast({
        title: "Authentication Required",
        description: "Please sign in to analyze your code",
        variant: "destructive",
      });
      return;
    }

    console.debug('✅ User found:', user.email);

    // Check subscription limits before starting analysis
    const canAnalyze = canPerformAnalysis();
    console.debug('🔒 Can perform analysis:', canAnalyze);

    if (!canAnalyze) {
      const remaining = getRemainingAnalyses();
      console.debug('❌ Analysis limit reached, remaining:', remaining);
      toast({
        title: "Analysis Limit Reached",
        description: `You have ${remaining} analyses remaining this month. Upgrade to Pro for unlimited access.`,
        variant: "destructive",
      });
      return;
    }

    // Increment usage count
    console.debug('📊 Incrementing analysis count...');
    const canProceed = await incrementAnalysisCount();
    console.debug('📊 Can proceed after increment:', canProceed);

    if (!canProceed) {
      console.debug('❌ Cannot proceed after increment');
      return;
    }

    console.debug('🚀 Starting analysis...');
    setUploadedFiles(files);
    setIsAnalyzing(true);
    setFixedFiles(new Map());

    try {
      console.debug('📁 Reading file contents...');
      const fileContents = await Promise.all(
        files.map(async (file) => {
          const content = await file.text();
          console.debug(`📄 Read file ${file.name}, content length:`, content.length);
          return {
            name: file.name,
            content
          };
        })
      );

      console.debug('🔬 Running analyzer...');
      const projectAnalysis = await analyzer.analyzeProject(fileContents);
      console.debug('📊 Analysis complete:', projectAnalysis);

      setAnalysis(projectAnalysis);
      console.debug('✅ Analysis state set');

      // Save analysis to database
      try {
        const { data: project, error: projectError } = await supabase
          .from('analysis_projects')
          .insert({
            user_id: user.id,
            name: `NeuroLint Analysis ${new Date().toLocaleDateString()}`,
            file_count: files.length,
            total_issues: projectAnalysis.summary.totalIssues,
            critical_issues: projectAnalysis.summary.criticalIssues,
            status: 'completed'
          })
          .select()
          .single();

        if (projectError) throw projectError;

        // Save individual file results - convert to JSON-compatible format
        const resultsToInsert = projectAnalysis.files.map(file => ({
          project_id: project.id,
          file_name: file.fileName,
          file_content: fileContents.find(f => f.name === file.fileName)?.content || '',
          issues: JSON.parse(JSON.stringify(file.issues)),
          metrics: JSON.parse(JSON.stringify(file.metrics))
        }));

        const { error: resultsError } = await supabase
          .from('analysis_results')
          .insert(resultsToInsert);

        if (resultsError) throw resultsError;

      } catch (dbError) {
        console.error('Failed to save analysis to database:', dbError);
        // Don't show error to user as analysis still works locally
      }

      const remaining = getRemainingAnalyses();
      const limitMessage = remaining > 0 
        ? ` You have ${remaining} analyses remaining this month.`
        : remaining === 0
        ? " You've reached your monthly limit. Upgrade for unlimited access!"
        : "";

      toast({
        title: "Analysis Complete",
        description: `Found ${projectAnalysis.summary.totalIssues} issues across ${files.length} files.${limitMessage}`,
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your files",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFixIssue = (issue: CodeIssue) => {
    if (!analysis) return;

    if (issue.autoFixable) {
      const fileResult = analysis.files.find(f => f.fileName === issue.file);
      if (fileResult) {
        // Use the current fixed content if available, otherwise use original content
        const currentContent = fixedFiles.get(issue.file) || fileResult.content;
        const fixedContent = applyAutoFix(issue.file, currentContent, issue);

        if (fixedContent !== currentContent) {
          const newFixedFiles = new Map(fixedFiles);
          newFixedFiles.set(issue.file, fixedContent);
          setFixedFiles(newFixedFiles);

          // Update the analysis to remove the fixed issue and update content
          const updatedAnalysis = {
            ...analysis,
            files: analysis.files.map(file => 
              file.fileName === issue.file 
                ? { 
                    ...file, 
                    content: fixedContent,
                    issues: file.issues.filter(i => i.id !== issue.id) 
                  }
                : file
            )
          };

          // Recalculate summary
          const allIssues = updatedAnalysis.files.flatMap(f => f.issues);
          updatedAnalysis.summary = {
            totalIssues: allIssues.length,
            errorCount: allIssues.filter(i => i.severity === 'error').length,
            warningCount: allIssues.filter(i => i.severity === 'warning').length,
            infoCount: allIssues.filter(i => i.severity === 'info').length,
            fixableCount: allIssues.filter(i => i.fixable).length,
            autoFixableCount: allIssues.filter(i => i.autoFixable).length,
            criticalIssues: allIssues.filter(i => i.severity === 'error' && i.layer <= 2).length,
          };

          setAnalysis(updatedAnalysis);

          toast({
            title: "Issue Fixed",
            description: `Successfully fixed: ${issue.message}`,
          });
        } else {
          toast({
            title: "Fix Failed",
            description: "Could not apply automatic fix for this issue",
            variant: "destructive",
          });
        }
      }
    } else {
      toast({
        title: "Manual Fix Required",
        description: `This issue requires manual intervention: ${issue.message}`,
      });
    }
  };

  const handleFixAll = () => {
    if (!analysis) return;

    const autoFixableIssues = analysis.files
      .flatMap(file => file.issues)
      .filter(issue => issue.autoFixable);

    console.debug(`🔧 handleFixAll: Found ${autoFixableIssues.length} auto-fixable issues`);
    console.debug('🔧 Auto-fixable issue IDs:', autoFixableIssues.map(i => `${i.id} (${i.type})`));

    if (autoFixableIssues.length > 0) {
      let fixedCount = 0;
      const newFixedFiles = new Map(fixedFiles);
      const actuallyFixedIssueIds = new Set<string>();

      autoFixableIssues.forEach(issue => {
        const fileResult = analysis.files.find(f => f.fileName === issue.file);
        if (fileResult) {
          const currentContent = newFixedFiles.get(issue.file) || fileResult.content;
          const fixedContent = applyAutoFix(issue.file, currentContent, issue);

          if (fixedContent !== currentContent) {
            newFixedFiles.set(issue.file, fixedContent);
            actuallyFixedIssueIds.add(issue.id);
            fixedCount++;
          }
        }
      });

      if (fixedCount > 0) {
        setFixedFiles(newFixedFiles);

        console.debug(`🔧 Actually fixed ${fixedCount} issues. Fixed issue IDs:`, Array.from(actuallyFixedIssueIds));

        // Update analysis to remove only the actually fixed issues and update content
        const updatedAnalysis = {
          ...analysis,
          files: analysis.files.map(file => ({
            ...file,
            content: newFixedFiles.get(file.fileName) || file.content,
            issues: file.issues.filter(issue => !actuallyFixedIssueIds.has(issue.id))
          }))
        };

        // Recalculate summary
        const allIssues = updatedAnalysis.files.flatMap(f => f.issues);
        updatedAnalysis.summary = {
          totalIssues: allIssues.length,
          errorCount: allIssues.filter(i => i.severity === 'error').length,
          warningCount: allIssues.filter(i => i.severity === 'warning').length,
          infoCount: allIssues.filter(i => i.severity === 'info').length,
          fixableCount: allIssues.filter(i => i.fixable).length,
          autoFixableCount: allIssues.filter(i => i.autoFixable).length,
          criticalIssues: allIssues.filter(i => i.severity === 'error' && i.layer <= 2).length,
        };

        setAnalysis(updatedAnalysis);

        toast({
          title: "Fixes Applied",
          description: `Successfully fixed ${fixedCount} issues`,
        });
      }
    } else {
      toast({
        title: "No Auto-fixable Issues",
        description: "All remaining issues require manual intervention",
      });
    }
  };

  const downloadFixedFiles = () => {
    if (fixedFiles.size === 0) {
      toast({
        title: "No Fixed Files",
        description: "No files have been auto-fixed yet",
        variant: "destructive",
      });
      return;
    }

    fixedFiles.forEach((content, fileName) => {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fixed_${fileName}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });

    toast({
      title: "Download Complete",
      description: `Downloaded ${fixedFiles.size} fixed files`,
    });
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setUploadedFiles([]);
    setFixedFiles(new Map());
  };

  return {
    analysis,
    isAnalyzing,
    uploadedFiles,
    fixedFiles,
    handleFilesSelected,
    handleFixIssue,
    handleFixAll,
    downloadFixedFiles,
    resetAnalysis
  };
};