export interface LineIssue {
  line: number;
  issue: string;
  fix: string;
}

export interface DebugReport {
  errorSummary: string;
  language: string;
  explanation: string;
  lineIssues: LineIssue[];
  correctedCode: string;
  fileNameSuggested: string;
}

export interface LanguageProfile {
  id: string;
  name: string;
  ext: string;
  icon: string;
  sampleCode: string;
  sampleError: string;
}
