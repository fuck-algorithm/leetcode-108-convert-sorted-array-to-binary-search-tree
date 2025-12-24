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
    
    // 根据当前步骤和行号显示变量值
    const vars = currentStep.variables;
    
    // 根据不同语言和行号匹配变量显示
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
                  {renderSyntaxHighlight(line, language)}
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

// 简单的语法高亮
function renderSyntaxHighlight(line: string, language: ProgrammingLanguage): React.ReactNode {
  const keywords: Record<ProgrammingLanguage, string[]> = {
    java: ['class', 'public', 'private', 'int', 'return', 'if', 'new', 'null'],
    python: ['class', 'def', 'self', 'return', 'if', 'None', 'int'],
    golang: ['func', 'return', 'if', 'nil', 'int', 'var'],
    javascript: ['function', 'var', 'const', 'let', 'return', 'if', 'new', 'null']
  };

  const types: Record<ProgrammingLanguage, string[]> = {
    java: ['TreeNode', 'Solution'],
    python: ['TreeNode', 'Solution', 'List'],
    golang: ['TreeNode'],
    javascript: ['TreeNode']
  };

  let result = line;
  
  // 高亮注释
  if (language === 'python') {
    result = result.replace(/(#.*)$/, '<span class="comment">$1</span>');
  } else {
    result = result.replace(/(\/\/.*)$/, '<span class="comment">$1</span>');
  }

  // 高亮关键字
  keywords[language].forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
    result = result.replace(regex, '<span class="keyword">$1</span>');
  });

  // 高亮类型
  types[language].forEach(type => {
    const regex = new RegExp(`\\b(${type})\\b`, 'g');
    result = result.replace(regex, '<span class="type">$1</span>');
  });

  // 高亮数字
  result = result.replace(/\b(\d+)\b/g, '<span class="number">$1</span>');

  // 高亮字符串
  result = result.replace(/(".*?")/g, '<span class="string">$1</span>');

  return <span dangerouslySetInnerHTML={{ __html: result }} />;
}
