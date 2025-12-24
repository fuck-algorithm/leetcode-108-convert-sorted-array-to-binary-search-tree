import { useState } from 'react';
import { validateInput, generateRandomArray } from '../../utils/algorithm';
import type { AlgorithmMethod } from '../../types';
import { getMethodDisplayName } from '../../utils/codeTemplates';
import './InputPanel.css';

interface InputPanelProps {
  onInputChange: (nums: number[]) => void;
  currentMethod: AlgorithmMethod;
  onMethodChange: (method: AlgorithmMethod) => void;
}

const SAMPLE_DATA = [
  { label: '示例1', value: '[-10,-3,0,5,9]' },
  { label: '示例2', value: '[1,3]' },
  { label: '示例3', value: '[1,2,3,4,5,6,7]' },
  { label: '示例4', value: '[-5,-3,-1,0,2,4,6,8]' },
];

export function InputPanel({ onInputChange, currentMethod, onMethodChange }: InputPanelProps) {
  const [inputValue, setInputValue] = useState('[-10,-3,0,5,9]');
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setError(null);
  };

  const handleSubmit = () => {
    const result = validateInput(inputValue);
    if (result.valid) {
      setError(null);
      onInputChange(result.nums);
    } else {
      setError(result.error || '输入无效');
    }
  };

  const handleSampleClick = (value: string) => {
    setInputValue(value);
    setError(null);
    const result = validateInput(value);
    if (result.valid) {
      onInputChange(result.nums);
    }
  };

  const handleRandomGenerate = () => {
    const nums = generateRandomArray();
    const value = `[${nums.join(',')}]`;
    setInputValue(value);
    setError(null);
    onInputChange(nums);
  };

  const methods: AlgorithmMethod[] = ['left-mid', 'right-mid', 'random-mid'];

  return (
    <div className="input-panel">
      <div className="input-section">
        <div className="input-row">
          <label className="input-label">输入数组:</label>
          <input
            type="text"
            className="input-field"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="输入有序数组，如 [-10,-3,0,5,9]"
          />
          <button className="submit-btn" onClick={handleSubmit}>
            确认
          </button>
          <button className="random-btn" onClick={handleRandomGenerate}>
            🎲 随机生成
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="samples-row">
          <span className="samples-label">示例数据:</span>
          {SAMPLE_DATA.map((sample, index) => (
            <button
              key={index}
              className="sample-btn"
              onClick={() => handleSampleClick(sample.value)}
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      <div className="method-section">
        <span className="method-label">解法选择:</span>
        <div className="method-tabs">
          {methods.map((method) => (
            <button
              key={method}
              className={`method-tab ${currentMethod === method ? 'active' : ''}`}
              onClick={() => onMethodChange(method)}
            >
              {getMethodDisplayName(method)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
