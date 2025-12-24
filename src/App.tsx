import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Header } from './components/Header/Header';
import { InputPanel } from './components/InputPanel/InputPanel';
import { CodePanel } from './components/CodePanel/CodePanel';
import { Canvas } from './components/Canvas/Canvas';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { AlgorithmIdeaModal } from './components/AlgorithmIdeaModal/AlgorithmIdeaModal';
import { WeChatFloat } from './components/WeChatFloat/WeChatFloat';
import { generateSteps } from './utils/algorithm';
import type { AlgorithmMethod, PlaybackState } from './types';
import './App.css';

function App() {
  const [inputArray, setInputArray] = useState<number[]>([-10, -3, 0, 5, 9]);
  const [method, setMethod] = useState<AlgorithmMethod>('left-mid');
  const [showAlgorithmIdea, setShowAlgorithmIdea] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  // 用于追踪输入变化的 key
  const [inputKey, setInputKey] = useState(0);

  const playIntervalRef = useRef<number | null>(null);

  // 使用 useMemo 生成算法步骤
  const steps = useMemo(() => {
    return generateSteps(inputArray, method);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputKey]);

  // 自动播放
  useEffect(() => {
    if (isPlaying && currentStepIndex < steps.length - 1) {
      const interval = 1000 / speed;
      playIntervalRef.current = window.setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, interval);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    };
  }, [isPlaying, speed, steps.length, currentStepIndex]);

  // 构建 playbackState 对象
  const playbackState: PlaybackState = useMemo(() => ({
    isPlaying,
    currentStep: currentStepIndex,
    speed,
    totalSteps: steps.length
  }), [isPlaying, currentStepIndex, speed, steps.length]);

  const handleInputChange = useCallback((nums: number[]) => {
    setInputArray(nums);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setInputKey(k => k + 1);
  }, []);

  const handleMethodChange = useCallback((newMethod: AlgorithmMethod) => {
    setMethod(newMethod);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setInputKey(k => k + 1);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => {
      // 如果已经到末尾，从头开始播放
      if (currentStepIndex >= steps.length - 1 && !prev) {
        setCurrentStepIndex(0);
        return true;
      }
      return !prev;
    });
  }, [currentStepIndex, steps.length]);

  const handlePrevStep = useCallback(() => {
    setCurrentStepIndex(prev => Math.max(0, prev - 1));
    setIsPlaying(false);
  }, []);

  const handleNextStep = useCallback(() => {
    setCurrentStepIndex(prev => Math.min(steps.length - 1, prev + 1));
    setIsPlaying(false);
  }, [steps.length]);

  const handleReset = useCallback(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
  }, []);

  const handleStepChange = useCallback((step: number) => {
    setCurrentStepIndex(step);
    setIsPlaying(false);
  }, []);

  const currentStep = steps[currentStepIndex] || null;

  return (
    <div className="app">
      <Header onShowAlgorithmIdea={() => setShowAlgorithmIdea(true)} />
      
      <InputPanel
        onInputChange={handleInputChange}
        currentMethod={method}
        onMethodChange={handleMethodChange}
      />
      
      <div className="main-content">
        <div className="code-section">
          <CodePanel currentStep={currentStep} method={method} />
        </div>
        
        <div className="canvas-section">
          <Canvas currentStep={currentStep} inputArray={inputArray} />
        </div>
      </div>
      
      <ControlPanel
        playbackState={playbackState}
        onPlayPause={handlePlayPause}
        onPrevStep={handlePrevStep}
        onNextStep={handleNextStep}
        onReset={handleReset}
        onSpeedChange={handleSpeedChange}
        onStepChange={handleStepChange}
      />

      <AlgorithmIdeaModal
        isOpen={showAlgorithmIdea}
        onClose={() => setShowAlgorithmIdea(false)}
      />

      <WeChatFloat />
    </div>
  );
}

export default App;
