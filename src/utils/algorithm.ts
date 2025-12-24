import type { TreeNode, AlgorithmStep, CallStackFrame, Annotation, AlgorithmMethod } from '../types';

let stepId = 0;
let nodeId = 0;

function generateNodeId(): string {
  return `node-${nodeId++}`;
}

function cloneTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return {
    val: node.val,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
    id: node.id
  };
}

// 生成算法步骤 - 选择中间位置左边的数字作为根节点
export function generateStepsLeftMid(nums: number[]): AlgorithmStep[] {
  stepId = 0;
  nodeId = 0;
  const steps: AlgorithmStep[] = [];
  let currentTree: TreeNode | null = null;
  const callStack: CallStackFrame[] = [];

  function helper(
    left: number,
    right: number,
    parentNodeId: string | null,
    direction: 'left' | 'right' | null,
    depth: number
  ): TreeNode | null {
    const frameId = `frame-${stepId}`;
    
    // 进入递归
    callStack.push({
      id: frameId,
      functionName: 'helper',
      left,
      right,
      mid: null,
      depth
    });

    const annotations: Annotation[] = [];
    
    if (parentNodeId) {
      annotations.push({
        id: `ann-${stepId}`,
        type: 'text',
        targetNodeId: parentNodeId,
        position: direction === 'left' ? 'left' : 'right',
        text: `递归进入: helper(${left}, ${right})`
      });
    }

    steps.push({
      id: stepId++,
      description: `进入递归: helper(nums, ${left}, ${right})`,
      highlightLines: {
        java: [2, 6],
        python: [2, 5],
        golang: [2, 6],
        javascript: [2, 6]
      },
      treeState: cloneTree(currentTree),
      currentNodeId: null,
      leftBound: left,
      rightBound: right,
      midIndex: null,
      action: 'enter',
      variables: { left, right, mid: null },
      callStack: [...callStack],
      annotations
    });

    // 基准情况
    if (left > right) {
      steps.push({
        id: stepId++,
        description: `基准情况: left(${left}) > right(${right})，返回 null`,
        highlightLines: {
          java: [7, 8, 9],
          python: [6, 7],
          golang: [7, 8, 9],
          javascript: [7, 8, 9]
        },
        treeState: cloneTree(currentTree),
        currentNodeId: null,
        leftBound: left,
        rightBound: right,
        midIndex: null,
        action: 'base-case',
        variables: { left, right, mid: null, result: 'null' },
        callStack: [...callStack],
        annotations: [{
          id: `ann-${stepId}`,
          type: 'text',
          position: 'top',
          text: `left > right，返回空节点`
        }]
      });

      callStack.pop();
      return null;
    }

    // 计算中间位置
    const mid = Math.floor((left + right) / 2);
    callStack[callStack.length - 1].mid = mid;

    steps.push({
      id: stepId++,
      description: `计算中间位置: mid = (${left} + ${right}) / 2 = ${mid}，选择 nums[${mid}] = ${nums[mid]} 作为根节点`,
      highlightLines: {
        java: [11, 12],
        python: [9, 10],
        golang: [11, 12],
        javascript: [11, 12]
      },
      treeState: cloneTree(currentTree),
      currentNodeId: null,
      leftBound: left,
      rightBound: right,
      midIndex: mid,
      action: 'create',
      variables: { left, right, mid, 'nums[mid]': nums[mid] },
      callStack: [...callStack],
      annotations: [{
        id: `ann-${stepId}`,
        type: 'highlight',
        position: 'top',
        text: `选择中间位置左边: mid = ${mid}`
      }]
    });

    // 创建节点
    const newNodeId = generateNodeId();
    const node: TreeNode = {
      val: nums[mid],
      left: null,
      right: null,
      id: newNodeId
    };

    // 更新树结构
    if (!currentTree) {
      currentTree = node;
    } else {
      // 找到父节点并连接
      const attachNode = (root: TreeNode | null, parentId: string, dir: 'left' | 'right', newNode: TreeNode): boolean => {
        if (!root) return false;
        if (root.id === parentId) {
          if (dir === 'left') {
            root.left = newNode;
          } else {
            root.right = newNode;
          }
          return true;
        }
        return attachNode(root.left, parentId, dir, newNode) || attachNode(root.right, parentId, dir, newNode);
      };
      if (parentNodeId && direction) {
        attachNode(currentTree, parentNodeId, direction, node);
      }
    }

    steps.push({
      id: stepId++,
      description: `创建节点: TreeNode(${nums[mid]})`,
      highlightLines: {
        java: [14],
        python: [12],
        golang: [14],
        javascript: [14]
      },
      treeState: cloneTree(currentTree),
      currentNodeId: newNodeId,
      leftBound: left,
      rightBound: right,
      midIndex: mid,
      action: 'create',
      variables: { left, right, mid, 'root.val': nums[mid] },
      callStack: [...callStack],
      annotations: [{
        id: `ann-${stepId}`,
        type: 'text',
        targetNodeId: newNodeId,
        position: 'top',
        text: `新建节点: ${nums[mid]}`
      }]
    });

    // 递归左子树
    steps.push({
      id: stepId++,
      description: `递归构建左子树: helper(nums, ${left}, ${mid - 1})`,
      highlightLines: {
        java: [15],
        python: [13],
        golang: [15],
        javascript: [15]
      },
      treeState: cloneTree(currentTree),
      currentNodeId: newNodeId,
      leftBound: left,
      rightBound: mid - 1,
      midIndex: mid,
      action: 'recurse-left',
      variables: { left, right, mid, 'left-range': `[${left}, ${mid - 1}]` },
      callStack: [...callStack],
      annotations: [{
        id: `ann-${stepId}`,
        type: 'arrow',
        targetNodeId: newNodeId,
        position: 'left',
        text: `递归左子树`
      }]
    });

    node.left = helper(left, mid - 1, newNodeId, 'left', depth + 1);

    // 递归右子树
    steps.push({
      id: stepId++,
      description: `递归构建右子树: helper(nums, ${mid + 1}, ${right})`,
      highlightLines: {
        java: [16],
        python: [14],
        golang: [16],
        javascript: [16]
      },
      treeState: cloneTree(currentTree),
      currentNodeId: newNodeId,
      leftBound: mid + 1,
      rightBound: right,
      midIndex: mid,
      action: 'recurse-right',
      variables: { left, right, mid, 'right-range': `[${mid + 1}, ${right}]` },
      callStack: [...callStack],
      annotations: [{
        id: `ann-${stepId}`,
        type: 'arrow',
        targetNodeId: newNodeId,
        position: 'right',
        text: `递归右子树`
      }]
    });

    node.right = helper(mid + 1, right, newNodeId, 'right', depth + 1);

    // 返回节点
    steps.push({
      id: stepId++,
      description: `返回节点: TreeNode(${nums[mid]})`,
      highlightLines: {
        java: [17],
        python: [15],
        golang: [17],
        javascript: [17]
      },
      treeState: cloneTree(currentTree),
      currentNodeId: newNodeId,
      leftBound: left,
      rightBound: right,
      midIndex: mid,
      action: 'return',
      variables: { left, right, mid, 'return': `TreeNode(${nums[mid]})` },
      callStack: [...callStack],
      annotations: [{
        id: `ann-${stepId}`,
        type: 'text',
        targetNodeId: newNodeId,
        position: 'bottom',
        text: `返回节点 ${nums[mid]}`
      }]
    });

    callStack.pop();
    return node;
  }

  // 初始步骤
  steps.push({
    id: stepId++,
    description: `开始构建平衡二叉搜索树，输入数组: [${nums.join(', ')}]`,
    highlightLines: {
      java: [1, 2, 3],
      python: [1, 2],
      golang: [1, 2, 3],
      javascript: [1, 2, 3]
    },
    treeState: null,
    currentNodeId: null,
    leftBound: 0,
    rightBound: nums.length - 1,
    midIndex: null,
    action: 'enter',
    variables: { 'nums.length': nums.length },
    callStack: [],
    annotations: []
  });

  helper(0, nums.length - 1, null, null, 0);

  // 完成步骤
  steps.push({
    id: stepId++,
    description: `构建完成！平衡二叉搜索树已生成`,
    highlightLines: {
      java: [3],
      python: [2],
      golang: [3],
      javascript: [3]
    },
    treeState: cloneTree(currentTree),
    currentNodeId: null,
    leftBound: 0,
    rightBound: nums.length - 1,
    midIndex: null,
    action: 'return',
    variables: { result: '完成' },
    callStack: [],
    annotations: [{
      id: `ann-final`,
      type: 'text',
      position: 'top',
      text: `平衡二叉搜索树构建完成`
    }]
  });

  return steps;
}

// 生成算法步骤 - 选择中间位置右边的数字作为根节点
export function generateStepsRightMid(nums: number[]): AlgorithmStep[] {
  stepId = 0;
  nodeId = 0;
  const steps: AlgorithmStep[] = [];
  let currentTree: TreeNode | null = null;
  const callStack: CallStackFrame[] = [];

  function helper(
    left: number,
    right: number,
    parentNodeId: string | null,
    direction: 'left' | 'right' | null,
    depth: number
  ): TreeNode | null {
    const frameId = `frame-${stepId}`;
    
    callStack.push({
      id: frameId,
      functionName: 'helper',
      left,
      right,
      mid: null,
      depth
    });

    steps.push({
      id: stepId++,
      description: `进入递归: helper(nums, ${left}, ${right})`,
      highlightLines: {
        java: [2, 6],
        python: [2, 5],
        golang: [2, 6],
        javascript: [2, 6]
      },
      treeState: cloneTree(currentTree),
      currentNodeId: null,
      leftBound: left,
      rightBound: right,
      midIndex: null,
      action: 'enter',
      variables: { left, right, mid: null },
      callStack: [...callStack],
      annotations: []
    });

    if (left > right) {
      steps.push({
        id: stepId++,
        description: `基准情况: left(${left}) > right(${right})，返回 null`,
        highlightLines: {
          java: [7, 8, 9],
          python: [6, 7],
          golang: [7, 8, 9],
          javascript: [7, 8, 9]
        },
        treeState: cloneTree(currentTree),
        currentNodeId: null,
        leftBound: left,
        rightBound: right,
        midIndex: null,
        action: 'base-case',
        variables: { left, right, mid: null, result: 'null' },
        callStack: [...callStack],
        annotations: []
      });

      callStack.pop();
      return null;
    }

    // 选择中间位置右边的数字
    const mid = Math.floor((left + right + 1) / 2);
    callStack[callStack.length - 1].mid = mid;

    steps.push({
      id: stepId++,
      description: `计算中间位置: mid = (${left} + ${right} + 1) / 2 = ${mid}，选择 nums[${mid}] = ${nums[mid]} 作为根节点`,
      highlightLines: {
        java: [11, 12],
        python: [9, 10],
        golang: [11, 12],
        javascript: [11, 12]
      },
      treeState: cloneTree(currentTree),
      currentNodeId: null,
      leftBound: left,
      rightBound: right,
      midIndex: mid,
      action: 'create',
      variables: { left, right, mid, 'nums[mid]': nums[mid] },
      callStack: [...callStack],
      annotations: [{
        id: `ann-${stepId}`,
        type: 'highlight',
        position: 'top',
        text: `选择中间位置右边: mid = ${mid}`
      }]
    });

    const newNodeId = generateNodeId();
    const node: TreeNode = {
      val: nums[mid],
      left: null,
      right: null,
      id: newNodeId
    };

    if (!currentTree) {
      currentTree = node;
    } else {
      const attachNode = (root: TreeNode | null, parentId: string, dir: 'left' | 'right', newNode: TreeNode): boolean => {
        if (!root) return false;
        if (root.id === parentId) {
          if (dir === 'left') {
            root.left = newNode;
          } else {
            root.right = newNode;
          }
          return true;
        }
        return attachNode(root.left, parentId, dir, newNode) || attachNode(root.right, parentId, dir, newNode);
      };
      if (parentNodeId && direction) {
        attachNode(currentTree, parentNodeId, direction, node);
      }
    }

    steps.push({
      id: stepId++,
      description: `创建节点: TreeNode(${nums[mid]})`,
      highlightLines: {
        java: [14],
        python: [12],
        golang: [14],
        javascript: [14]
      },
      treeState: cloneTree(currentTree),
      currentNodeId: newNodeId,
      leftBound: left,
      rightBound: right,
      midIndex: mid,
      action: 'create',
      variables: { left, right, mid, 'root.val': nums[mid] },
      callStack: [...callStack],
      annotations: [{
        id: `ann-${stepId}`,
        type: 'text',
        targetNodeId: newNodeId,
        position: 'top',
        text: `新建节点: ${nums[mid]}`
      }]
    });

    steps.push({
      id: stepId++,
      description: `递归构建左子树: helper(nums, ${left}, ${mid - 1})`,
      highlightLines: {
        java: [15],
        python: [13],
        golang: [15],
        javascript: [15]
      },
      treeState: cloneTree(currentTree),
      currentNodeId: newNodeId,
      leftBound: left,
      rightBound: mid - 1,
      midIndex: mid,
      action: 'recurse-left',
      variables: { left, right, mid, 'left-range': `[${left}, ${mid - 1}]` },
      callStack: [...callStack],
      annotations: []
    });

    node.left = helper(left, mid - 1, newNodeId, 'left', depth + 1);

    steps.push({
      id: stepId++,
      description: `递归构建右子树: helper(nums, ${mid + 1}, ${right})`,
      highlightLines: {
        java: [16],
        python: [14],
        golang: [16],
        javascript: [16]
      },
      treeState: cloneTree(currentTree),
      currentNodeId: newNodeId,
      leftBound: mid + 1,
      rightBound: right,
      midIndex: mid,
      action: 'recurse-right',
      variables: { left, right, mid, 'right-range': `[${mid + 1}, ${right}]` },
      callStack: [...callStack],
      annotations: []
    });

    node.right = helper(mid + 1, right, newNodeId, 'right', depth + 1);

    steps.push({
      id: stepId++,
      description: `返回节点: TreeNode(${nums[mid]})`,
      highlightLines: {
        java: [17],
        python: [15],
        golang: [17],
        javascript: [17]
      },
      treeState: cloneTree(currentTree),
      currentNodeId: newNodeId,
      leftBound: left,
      rightBound: right,
      midIndex: mid,
      action: 'return',
      variables: { left, right, mid, 'return': `TreeNode(${nums[mid]})` },
      callStack: [...callStack],
      annotations: []
    });

    callStack.pop();
    return node;
  }

  steps.push({
    id: stepId++,
    description: `开始构建平衡二叉搜索树，输入数组: [${nums.join(', ')}]`,
    highlightLines: {
      java: [1, 2, 3],
      python: [1, 2],
      golang: [1, 2, 3],
      javascript: [1, 2, 3]
    },
    treeState: null,
    currentNodeId: null,
    leftBound: 0,
    rightBound: nums.length - 1,
    midIndex: null,
    action: 'enter',
    variables: { 'nums.length': nums.length },
    callStack: [],
    annotations: []
  });

  helper(0, nums.length - 1, null, null, 0);

  steps.push({
    id: stepId++,
    description: `构建完成！平衡二叉搜索树已生成`,
    highlightLines: {
      java: [3],
      python: [2],
      golang: [3],
      javascript: [3]
    },
    treeState: cloneTree(currentTree),
    currentNodeId: null,
    leftBound: 0,
    rightBound: nums.length - 1,
    midIndex: null,
    action: 'return',
    variables: { result: '完成' },
    callStack: [],
    annotations: []
  });

  return steps;
}

// 根据方法生成步骤
export function generateSteps(nums: number[], method: AlgorithmMethod): AlgorithmStep[] {
  switch (method) {
    case 'left-mid':
      return generateStepsLeftMid(nums);
    case 'right-mid':
      return generateStepsRightMid(nums);
    case 'random-mid':
      // 随机选择左或右
      return Math.random() < 0.5 ? generateStepsLeftMid(nums) : generateStepsRightMid(nums);
    default:
      return generateStepsLeftMid(nums);
  }
}

// 验证输入数组
export function validateInput(input: string): { valid: boolean; nums: number[]; error?: string } {
  try {
    // 移除空格
    const trimmed = input.trim();
    
    // 尝试解析为数组
    let nums: number[];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      nums = JSON.parse(trimmed);
    } else {
      // 支持逗号分隔的格式
      nums = trimmed.split(',').map(s => {
        const n = parseInt(s.trim(), 10);
        if (isNaN(n)) throw new Error('Invalid number');
        return n;
      });
    }

    // 验证数组长度
    if (nums.length < 1 || nums.length > 10000) {
      return { valid: false, nums: [], error: '数组长度必须在 1 到 10000 之间' };
    }

    // 验证数值范围
    for (const n of nums) {
      if (n < -10000 || n > 10000) {
        return { valid: false, nums: [], error: '数组元素必须在 -10000 到 10000 之间' };
      }
    }

    // 验证严格递增
    for (let i = 1; i < nums.length; i++) {
      if (nums[i] <= nums[i - 1]) {
        return { valid: false, nums: [], error: '数组必须是严格递增的' };
      }
    }

    return { valid: true, nums };
  } catch {
    return { valid: false, nums: [], error: '输入格式错误，请输入有效的数组' };
  }
}

// 生成随机有序数组
export function generateRandomArray(): number[] {
  const length = Math.floor(Math.random() * 8) + 3; // 3-10个元素
  const nums: number[] = [];
  let current = Math.floor(Math.random() * 20) - 10; // 起始值 -10 到 10
  
  for (let i = 0; i < length; i++) {
    nums.push(current);
    current += Math.floor(Math.random() * 5) + 1; // 每次增加 1-5
  }
  
  return nums;
}
