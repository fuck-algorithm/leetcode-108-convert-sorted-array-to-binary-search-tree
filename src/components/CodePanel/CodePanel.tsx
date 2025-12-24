import { useEffect, useState } from 'react';
import type { ProgrammingLanguage, AlgorithmStep, AlgorithmMethod } from '../../types';
import { getCodeTemplate, getLanguageDisplayName } from '../../utils/codeTemplates';
import { getSetting, setSetting } from '../../utils/indexedDB';
import './CodePanel.css';

interface CodePanelProps {
  currentStep: AlgorithmStep | null;
  method: AlgorithmMethod;
}

const LANGUAGES: ProgrammingLanguage[] = ['java', 'python', 'golang', 'javascript'];

export function CodePanel({ currentStep, method }: CodePanelProps) {
  const [language, setLanguage] = useState<ProgrammingLanguage>('java');

  useEffect(() => {
    getSetting<ProgrammingLanguage>('language', 'java').then(setLanguage);
  }, []);

  const handleLanguageChange = async (lang: ProgrammingLanguage) => {
    setLanguage(lang);
    await setSetting('language', lang);
  };

  const { code } = getCodeTemplate(language, method);
  const lines = code.split('\n');
  const highlightLines = currentStep?.highlightLines[language] || [];

  const getVariableDisplay = (lineIndex: number): string | null => {
    if (!currentStep) return null;
    
    const vars = currentStep.variables;
    
    if (language === 'java' || language === 'javascript' || language === 'golang') {
      if (lineIndex === 11 && vars.mid !== null && vars.mid !== undefined) {
        return `// mid = ${vars.mid}`;
      }
      if (lineIndex === 13 && vars['root.val'] !== undefined) {
        return `// root.val = ${vars['root.val']}`;
      }
    } else if (language === 'python') {
      if (lineIndex === 9 && vars.mid !== null && vars.mid !== undefined) {
        return `# mid = ${vars.mid}`;
      }
      if (lineIndex === 11 && vars['root.val'] !== undefined) {
        return `# root.val = ${vars['root.val']}`;
      }
    }
    
    return null;
  };

  return (
    <div className="code-panel">
      <div className="code-header">
        <span className="code-title">算法代码</span>
        <div className="language-tabs">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              className={`language-tab ${language === lang ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang)}
            >
              {getLanguageDisplayName(lang)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="code-content">
        <pre className="code-block">
          {lines.map((line, index) => {
            const lineNumber = index + 1;
            const isHighlighted = highlightLines.includes(lineNumber);
            const variableDisplay = getVariableDisplay(index);
            
            return (
              <div
                key={index}
                className={`code-line ${isHighlighted ? 'highlighted' : ''}`}
              >
                <span className="line-number">{lineNumber}</span>
                <span className="line-content">
                  <SyntaxHighlightedLine line={line} language={language} />
                </span>
                {variableDisplay && (
                  <span className="variable-display">{variableDisplay}</span>
                )}
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}

// Token 类型
interface Token {
  type: 'keyword' | 'type' | 'number' | 'string' | 'comment' | 'text';
  value: string;
}

// 语法高亮组件
function SyntaxHighlightedLine({ line, language }: { line: string; language: ProgrammingLanguage }) {
  const tokens = tokenize(line, language);
  
  return (
    <>
      {tokens.map((token, index) => {
        if (token.type === 'text') {
          return <span key={index}>{token.value}</span>;
        }
        return (
          <span key={index} className={token.type}>
            {token.value}
          </span>
        );
      })}
    </>
  );
}

// 词法分析
function tokenize(line: string, language: ProgrammingLanguage): Token[] {
  const keywords: Record<ProgrammingLanguage, Set<string>> = {
    java: new Set(['class', 'public', 'private', 'int', 'return', 'if', 'new', 'null']),
    python: new Set(['class', 'def', 'self', 'return', 'if', 'None', 'int']),
    golang: new Set(['func', 'return', 'if', 'nil', 'int', 'var']),
    javascript: new Set(['function', 'var', 'const', 'let', 'return', 'if', 'new', 'null'])
  };

  const types: Record<ProgrammingLanguage, Set<string>> = {
    java: new Set(['TreeNode', 'Solution']),
    python: new Set(['TreeNode', 'Solution', 'List']),
    golang: new Set(['TreeNode']),
    javascript: new Set(['TreeNode'])
  };

  const tokens: Token[] = [];
  let remaining = line;
  
  // 检查注释
  const commentStart = language === 'python' ? '#' : '//';
  const commentIndex = remaining.indexOf(commentStart);
  
  let mainPart = remaining;
  let commentPart = '';
  
  if (commentIndex !== -1) {
    mainPart = remaining.substring(0, commentIndex);
    commentPart = remaining.substring(commentIndex);
  }
  
  // 处理主要部分
  const wordRegex = /([a-zA-Z_][a-zA-Z0-9_]*)|(\d+)|(\s+)|([^\w\s]+)/g;
  let match;
  
  while ((match = wordRegex.exec(mainPart)) !== null) {
    const value = match[0];
    
    if (/^\d+$/.test(value)) {
      tokens.push({ type: 'number', value });
    } else if (/^[a-zA-Z_]/.test(value)) {
      if (keywords[language].has(value)) {
        tokens.push({ type: 'keyword', value });
      } else if (types[language].has(value)) {
        tokens.push({ type: 'type', value });
      } else {
        tokens.push({ type: 'text', value });
      }
    } else {
      tokens.push({ type: 'text', value });
    }
  }
  
  // 添加注释部分
  if (commentPart) {
    tokens.push({ type: 'comment', value: commentPart });
  }
  
  return tokens;
}
