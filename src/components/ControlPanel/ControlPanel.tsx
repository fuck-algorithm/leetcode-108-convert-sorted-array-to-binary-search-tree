import { useEffect, useCallback } from 'react';
import type { PlaybackState } from '../../types';
import { getSetting, setSetting } from '../../utils/indexedDB';
import './ControlPanel.css';

interface ControlPanelProps {
  playbackState: PlaybackState;
  onPlayPause: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onStepChange: (step: number) => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function ControlPanel({
  playbackState,
  onPlayPause,
  onPrevStep,
  onNextStep,
  onReset,
  onSpeedChange,
  onStepChange
}: ControlPanelProps) {
  const { isPlaying, currentStep, speed, totalSteps } = playbackState;

  // 加载保存的播放速度
  useEffect(() => {
    getSetting<number>('playbackSpeed', 1).then(savedSpeed => {
      if (SPEED_OPTIONS.includes(savedSpeed)) {
        onSpeedChange(savedSpeed);
      }
    });
  }, [onSpeedChange]);

  // 保存播放速度
  const handleSpeedChange = async (newSpeed: number) => {
    onSpeedChange(newSpeed);
    await setSetting('playbackSpeed', newSpeed);
  };

  // 键盘快捷键
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return;
    
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        onPlayPause();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        onPrevStep();
        break;
      case 'ArrowRight':
        e.preventDefault();
        onNextStep();
        break;
      case 'KeyR':
        e.preventDefault();
        onReset();
        break;
    }
  }, [onPlayPause, onPrevStep, onNextStep, onReset]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 进度条拖动
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStep = parseInt(e.target.value, 10);
    onStepChange(newStep);
  };

  const handleProgressMouseDown = () => {
    // 拖动时暂停播放
    if (isPlaying) {
      onPlayPause();
    }
  };

  const progress = totalSteps > 0 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="control-panel">
      <div className="control-row">
        <div className="control-buttons">
          <button
            className="control-btn"
            onClick={onPrevStep}
            disabled={currentStep === 0}
            title="上一步 (←)"
          >
            ⏮ <span className="shortcut">←</span>
          </button>

          <button
            className="control-btn play-btn"
            onClick={onPlayPause}
            title={isPlaying ? '暂停 (空格)' : '播放 (空格)'}
          >
            {isPlaying ? '⏸' : '▶'} <span className="shortcut">空格</span>
          </button>

          <button
            className="control-btn"
            onClick={onNextStep}
            disabled={currentStep >= totalSteps - 1}
            title="下一步 (→)"
          >
            ⏭ <span className="shortcut">→</span>
          </button>

          <button
            className="control-btn reset-btn"
            onClick={onReset}
            title="重置 (R)"
          >
            🔄 <span className="shortcut">R</span>
          </button>
        </div>

        <div className="control-right">
          <div className="speed-control">
            <span className="speed-label">速度</span>
            <div className="speed-buttons">
              {SPEED_OPTIONS.map(s => (
                <button
                  key={s}
                  className={`speed-btn ${speed === s ? 'active' : ''}`}
                  onClick={() => handleSpeedChange(s)}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div className="step-indicator">
            {currentStep + 1} / {totalSteps}
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
            <input
              type="range"
              className="progress-input"
              min={0}
              max={Math.max(0, totalSteps - 1)}
              value={currentStep}
              onChange={handleProgressChange}
              onMouseDown={handleProgressMouseDown}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
