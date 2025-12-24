import './AlgorithmIdeaModal.css';

interface AlgorithmIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AlgorithmIdeaModal({ isOpen, onClose }: AlgorithmIdeaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💡 算法思路</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <section className="idea-section">
            <h3>问题分析</h3>
            <p>
              二叉搜索树的中序遍历是升序序列，题目给定的数组是按照升序排序的有序数组，
              因此可以确保数组是二叉搜索树的中序遍历序列。
            </p>
          </section>

          <section className="idea-section">
            <h3>核心思路</h3>
            <p>
              选择中间数字作为二叉搜索树的根节点，这样分给左右子树的数字个数相同或只相差 1，
              可以使得树保持平衡。
            </p>
            <ul>
              <li>如果数组长度是奇数，则根节点的选择是唯一的</li>
              <li>如果数组长度是偶数，则可以选择中间位置左边或右边的数字作为根节点</li>
            </ul>
          </section>

          <section className="idea-section">
            <h3>递归构建</h3>
            <p>
              确定平衡二叉搜索树的根节点之后，其余的数字分别位于平衡二叉搜索树的左子树和右子树中，
              左子树和右子树分别也是平衡二叉搜索树，因此可以通过递归的方式创建平衡二叉搜索树。
            </p>
            <div className="code-snippet">
              <code>
                mid = (left + right) / 2<br/>
                root = TreeNode(nums[mid])<br/>
                root.left = helper(left, mid - 1)<br/>
                root.right = helper(mid + 1, right)
              </code>
            </div>
          </section>

          <section className="idea-section">
            <h3>基准情况</h3>
            <p>
              递归的基准情形是平衡二叉搜索树不包含任何数字，即 <code>left {'>'} right</code> 时，
              返回空节点 <code>null</code>。
            </p>
          </section>

          <section className="idea-section">
            <h3>复杂度分析</h3>
            <ul>
              <li><strong>时间复杂度：</strong>O(n)，其中 n 是数组的长度。每个数字只访问一次。</li>
              <li><strong>空间复杂度：</strong>O(log n)，递归栈的深度是 O(log n)。</li>
            </ul>
          </section>

          <section className="idea-section">
            <h3>三种方法的区别</h3>
            <ul>
              <li><strong>方法一：</strong>总是选择中间位置左边的数字作为根节点，mid = (left + right) / 2</li>
              <li><strong>方法二：</strong>总是选择中间位置右边的数字作为根节点，mid = (left + right + 1) / 2</li>
              <li><strong>方法三：</strong>随机选择中间位置左边或右边的数字作为根节点</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
