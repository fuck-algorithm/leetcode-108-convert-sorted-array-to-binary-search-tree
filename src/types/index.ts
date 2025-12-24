// 二叉树节点
export interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  id: string; // 用于动画追踪
  x?: number;
  y?: number;
}

// 算法步骤
export interface AlgorithmStep {
  id: number;
  description: string;
  highlightLines: {
    java: number[];
    python: number[];
    golang: number[];
    javascript: number[];
  };
  treeState: TreeNode | null;
  currentNodeId: string | null;
  leftBound: number;
  rightBound: number;
  midIndex: number | null;
  action: 'enter' | 'create' | 'recurse-left' | 'recurse-right' | 'return' | 'base-case';
  variables: Record<string, string | number | null>;
  callStack: CallStackFrame[];
  annotations: Annotation[];
}

// 调用栈帧
export interface CallStackFrame {
  id: string;
  functionName: string;
  left: number;
  right: number;
  mid: number | null;
  depth: number;
}

// 画布标注
export interface Annotation {
  id: string;
  type: 'text' | 'arrow' | 'highlight';
  targetNodeId?: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  text: string;
  fromNodeId?: string;
  toNodeId?: string;
}

// 编程语言
export type ProgrammingLanguage = 'java' | 'python' | 'golang' | 'javascript';

// 算法方法
export type AlgorithmMethod = 'left-mid' | 'right-mid' | 'random-mid';

// 播放状态
export interface PlaybackState {
  isPlaying: boolean;
  currentStep: number;
  speed: number;
  totalSteps: number;
}

// GitHub 仓库信息
export interface GitHubRepoInfo {
  stars: number;
  lastFetched: number;
}
