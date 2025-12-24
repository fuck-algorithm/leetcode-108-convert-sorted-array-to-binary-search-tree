import type { ProgrammingLanguage, AlgorithmMethod } from '../types';

interface CodeTemplate {
  code: string;
  lineCount: number;
}

// Java 代码模板 - 选择中间位置左边
const javaCodeLeftMid = `class Solution {
    public TreeNode sortedArrayToBST(int[] nums) {
        return helper(nums, 0, nums.length - 1);
    }

    public TreeNode helper(int[] nums, int left, int right) {
        if (left > right) {
            return null;
        }

        // 总是选择中间位置左边的数字作为根节点
        int mid = (left + right) / 2;

        TreeNode root = new TreeNode(nums[mid]);
        root.left = helper(nums, left, mid - 1);
        root.right = helper(nums, mid + 1, right);
        return root;
    }
}`;

// Java 代码模板 - 选择中间位置右边
const javaCodeRightMid = `class Solution {
    public TreeNode sortedArrayToBST(int[] nums) {
        return helper(nums, 0, nums.length - 1);
    }

    public TreeNode helper(int[] nums, int left, int right) {
        if (left > right) {
            return null;
        }

        // 总是选择中间位置右边的数字作为根节点
        int mid = (left + right + 1) / 2;

        TreeNode root = new TreeNode(nums[mid]);
        root.left = helper(nums, left, mid - 1);
        root.right = helper(nums, mid + 1, right);
        return root;
    }
}`;

// Python 代码模板 - 选择中间位置左边
const pythonCodeLeftMid = `class Solution:
    def sortedArrayToBST(self, nums: List[int]) -> TreeNode:
        return self.helper(nums, 0, len(nums) - 1)
    
    def helper(self, nums, left, right):
        if left > right:
            return None
        
        # 总是选择中间位置左边的数字作为根节点
        mid = (left + right) // 2
        
        root = TreeNode(nums[mid])
        root.left = self.helper(nums, left, mid - 1)
        root.right = self.helper(nums, mid + 1, right)
        return root`;

// Python 代码模板 - 选择中间位置右边
const pythonCodeRightMid = `class Solution:
    def sortedArrayToBST(self, nums: List[int]) -> TreeNode:
        return self.helper(nums, 0, len(nums) - 1)
    
    def helper(self, nums, left, right):
        if left > right:
            return None
        
        # 总是选择中间位置右边的数字作为根节点
        mid = (left + right + 1) // 2
        
        root = TreeNode(nums[mid])
        root.left = self.helper(nums, left, mid - 1)
        root.right = self.helper(nums, mid + 1, right)
        return root`;

// Golang 代码模板 - 选择中间位置左边
const golangCodeLeftMid = `func sortedArrayToBST(nums []int) *TreeNode {
    return helper(nums, 0, len(nums)-1)
}

func helper(nums []int, left, right int) *TreeNode {
    if left > right {
        return nil
    }

    // 总是选择中间位置左边的数字作为根节点
    mid := (left + right) / 2

    root := &TreeNode{Val: nums[mid]}
    root.Left = helper(nums, left, mid-1)
    root.Right = helper(nums, mid+1, right)
    return root
}`;

// Golang 代码模板 - 选择中间位置右边
const golangCodeRightMid = `func sortedArrayToBST(nums []int) *TreeNode {
    return helper(nums, 0, len(nums)-1)
}

func helper(nums []int, left, right int) *TreeNode {
    if left > right {
        return nil
    }

    // 总是选择中间位置右边的数字作为根节点
    mid := (left + right + 1) / 2

    root := &TreeNode{Val: nums[mid]}
    root.Left = helper(nums, left, mid-1)
    root.Right = helper(nums, mid+1, right)
    return root
}`;

// JavaScript 代码模板 - 选择中间位置左边
const javascriptCodeLeftMid = `var sortedArrayToBST = function(nums) {
    return helper(nums, 0, nums.length - 1);
};

function helper(nums, left, right) {
    if (left > right) {
        return null;
    }

    // 总是选择中间位置左边的数字作为根节点
    const mid = Math.floor((left + right) / 2);

    const root = new TreeNode(nums[mid]);
    root.left = helper(nums, left, mid - 1);
    root.right = helper(nums, mid + 1, right);
    return root;
}`;

// JavaScript 代码模板 - 选择中间位置右边
const javascriptCodeRightMid = `var sortedArrayToBST = function(nums) {
    return helper(nums, 0, nums.length - 1);
};

function helper(nums, left, right) {
    if (left > right) {
        return null;
    }

    // 总是选择中间位置右边的数字作为根节点
    const mid = Math.floor((left + right + 1) / 2);

    const root = new TreeNode(nums[mid]);
    root.left = helper(nums, left, mid - 1);
    root.right = helper(nums, mid + 1, right);
    return root;
}`;

export function getCodeTemplate(language: ProgrammingLanguage, method: AlgorithmMethod): CodeTemplate {
  const isLeftMid = method === 'left-mid' || method === 'random-mid';
  
  switch (language) {
    case 'java':
      return {
        code: isLeftMid ? javaCodeLeftMid : javaCodeRightMid,
        lineCount: 19
      };
    case 'python':
      return {
        code: isLeftMid ? pythonCodeLeftMid : pythonCodeRightMid,
        lineCount: 15
      };
    case 'golang':
      return {
        code: isLeftMid ? golangCodeLeftMid : golangCodeRightMid,
        lineCount: 17
      };
    case 'javascript':
      return {
        code: isLeftMid ? javascriptCodeLeftMid : javascriptCodeRightMid,
        lineCount: 17
      };
    default:
      return {
        code: isLeftMid ? javaCodeLeftMid : javaCodeRightMid,
        lineCount: 19
      };
  }
}

export function getLanguageDisplayName(language: ProgrammingLanguage): string {
  switch (language) {
    case 'java':
      return 'Java';
    case 'python':
      return 'Python';
    case 'golang':
      return 'Go';
    case 'javascript':
      return 'JavaScript';
    default:
      return language;
  }
}

export function getMethodDisplayName(method: AlgorithmMethod): string {
  switch (method) {
    case 'left-mid':
      return '方法一：选择中间位置左边';
    case 'right-mid':
      return '方法二：选择中间位置右边';
    case 'random-mid':
      return '方法三：随机选择中间位置';
    default:
      return method;
  }
}
