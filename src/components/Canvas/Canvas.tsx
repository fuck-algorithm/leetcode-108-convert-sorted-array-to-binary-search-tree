import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import type { AlgorithmStep, TreeNode } from '../../types';
import './Canvas.css';

interface CanvasProps {
  currentStep: AlgorithmStep | null;
  inputArray: number[];
}

interface NodePosition {
  id: string;
  val: number;
  x: number;
  y: number;
  parentX?: number;
  parentY?: number;
}

export function Canvas({ currentStep, inputArray }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });

  // 计算树的布局
  const calculateLayout = useCallback((root: TreeNode | null): NodePosition[] => {
    if (!root) return [];

    const positions: NodePosition[] = [];
    const nodeWidth = 60;
    const levelHeight = 80;

    // 计算每个节点的位置
    const calculatePositions = (
      node: TreeNode | null,
      depth: number,
      left: number,
      right: number,
      parentX?: number,
      parentY?: number
    ) => {
      if (!node) return;

      const x = (left + right) / 2;
      const y = depth * levelHeight + 60;

      positions.push({
        id: node.id,
        val: node.val,
        x,
        y,
        parentX,
        parentY
      });

      const childWidth = (right - left) / 2;
      calculatePositions(node.left, depth + 1, left, left + childWidth, x, y);
      calculatePositions(node.right, depth + 1, left + childWidth, right, x, y);
    };

    // 计算树的宽度
    const getTreeWidth = (node: TreeNode | null): number => {
      if (!node) return 0;
      return Math.max(1, getTreeWidth(node.left) + getTreeWidth(node.right));
    };

    const treeWidth = getTreeWidth(root);
    const totalWidth = Math.max(400, treeWidth * nodeWidth * 2);
    
    calculatePositions(root, 0, 0, totalWidth);

    return positions;
  }, []);

  // 绘制画布
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.attr('width', width).attr('height', height);

    // 清除之前的内容
    svg.selectAll('*').remove();

    // 创建主组
    const g = svg.append('g')
      .attr('transform', `translate(${transform.x + width / 2}, ${transform.y + 30}) scale(${transform.scale})`);

    // 绘制输入数组
    const arrayGroup = g.append('g').attr('class', 'array-group');
    const arrayY = -20;
    const cellWidth = 40;
    const arrayStartX = -(inputArray.length * cellWidth) / 2;

    inputArray.forEach((num, index) => {
      const x = arrayStartX + index * cellWidth;
      const isInRange = currentStep && 
        index >= currentStep.leftBound && 
        index <= currentStep.rightBound;
      const isMid = currentStep && index === currentStep.midIndex;

      // 数组单元格
      arrayGroup.append('rect')
        .attr('x', x)
        .attr('y', arrayY)
        .attr('width', cellWidth - 2)
        .attr('height', 30)
        .attr('rx', 4)
        .attr('fill', isMid ? '#48bb78' : isInRange ? '#4299e1' : '#2d3748')
        .attr('stroke', isMid ? '#68d391' : isInRange ? '#63b3ed' : '#4a5568')
        .attr('stroke-width', isMid ? 2 : 1);

      // 数组值
      arrayGroup.append('text')
        .attr('x', x + (cellWidth - 2) / 2)
        .attr('y', arrayY + 20)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f7fafc')
        .attr('font-size', '12px')
        .attr('font-weight', isMid ? 'bold' : 'normal')
        .text(num);

      // 索引
      arrayGroup.append('text')
        .attr('x', x + (cellWidth - 2) / 2)
        .attr('y', arrayY + 45)
        .attr('text-anchor', 'middle')
        .attr('fill', '#718096')
        .attr('font-size', '10px')
        .text(index);
    });

    // 绘制范围指示器
    if (currentStep && currentStep.leftBound <= currentStep.rightBound) {
      const leftX = arrayStartX + currentStep.leftBound * cellWidth;
      const rightX = arrayStartX + currentStep.rightBound * cellWidth + cellWidth - 2;

      // L 指针
      arrayGroup.append('text')
        .attr('x', leftX + (cellWidth - 2) / 2)
        .attr('y', arrayY - 8)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f687b3')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text('L');

      // R 指针
      arrayGroup.append('text')
        .attr('x', rightX - (cellWidth - 2) / 2)
        .attr('y', arrayY - 8)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f687b3')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text('R');

      // mid 指针
      if (currentStep.midIndex !== null) {
        const midX = arrayStartX + currentStep.midIndex * cellWidth;
        arrayGroup.append('text')
          .attr('x', midX + (cellWidth - 2) / 2)
          .attr('y', arrayY - 8)
          .attr('text-anchor', 'middle')
          .attr('fill', '#68d391')
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .text('mid');
      }
    }

    // 绘制树
    if (currentStep?.treeState) {
      const positions = calculateLayout(currentStep.treeState);
      const treeGroup = g.append('g').attr('class', 'tree-group').attr('transform', 'translate(0, 60)');

      // 绘制连线
      positions.forEach(pos => {
        if (pos.parentX !== undefined && pos.parentY !== undefined) {
          treeGroup.append('line')
            .attr('x1', pos.parentX)
            .attr('y1', pos.parentY + 20)
            .attr('x2', pos.x)
            .attr('y2', pos.y - 20)
            .attr('stroke', '#4a5568')
            .attr('stroke-width', 2);
        }
      });

      // 绘制节点
      positions.forEach(pos => {
        const isCurrentNode = pos.id === currentStep.currentNodeId;
        const nodeGroup = treeGroup.append('g')
          .attr('transform', `translate(${pos.x}, ${pos.y})`);

        // 节点圆圈
        nodeGroup.append('circle')
          .attr('r', 22)
          .attr('fill', isCurrentNode ? '#48bb78' : '#4299e1')
          .attr('stroke', isCurrentNode ? '#68d391' : '#63b3ed')
          .attr('stroke-width', isCurrentNode ? 3 : 2);

        // 节点值
        nodeGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('fill', '#fff')
          .attr('font-size', '14px')
          .attr('font-weight', 'bold')
          .text(pos.val);

        // 当前节点标注
        if (isCurrentNode) {
          nodeGroup.append('text')
            .attr('y', -35)
            .attr('text-anchor', 'middle')
            .attr('fill', '#68d391')
            .attr('font-size', '11px')
            .text('当前节点');
        }
      });

      // 绘制空节点指示
      const drawNullIndicator = (node: TreeNode | null, x: number, y: number) => {
        if (node === null) return;
        
        const childY = y + 80;

        if (node.left === null && node.right !== null) {
          // 左子节点为空
          treeGroup.append('line')
            .attr('x1', x)
            .attr('y1', y + 20)
            .attr('x2', x - 40)
            .attr('y2', childY - 10)
            .attr('stroke', '#4a5568')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4,4');

          treeGroup.append('text')
            .attr('x', x - 40)
            .attr('y', childY)
            .attr('text-anchor', 'middle')
            .attr('fill', '#718096')
            .attr('font-size', '11px')
            .text('null');
        }

        if (node.right === null && node.left !== null) {
          // 右子节点为空
          treeGroup.append('line')
            .attr('x1', x)
            .attr('y1', y + 20)
            .attr('x2', x + 40)
            .attr('y2', childY - 10)
            .attr('stroke', '#4a5568')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4,4');

          treeGroup.append('text')
            .attr('x', x + 40)
            .attr('y', childY)
            .attr('text-anchor', 'middle')
            .attr('fill', '#718096')
            .attr('font-size', '11px')
            .text('null');
        }
      };

      // 遍历树绘制空节点
      const traverseForNull = (node: TreeNode | null, nodePositions: NodePosition[]) => {
        if (!node) return;
        const pos = nodePositions.find(p => p.id === node.id);
        if (pos) {
          drawNullIndicator(node, pos.x, pos.y);
        }
        traverseForNull(node.left, nodePositions);
        traverseForNull(node.right, nodePositions);
      };

      traverseForNull(currentStep.treeState, positions);
    }

    // 绘制调用栈
    if (currentStep?.callStack && currentStep.callStack.length > 0) {
      const stackGroup = g.append('g')
        .attr('class', 'stack-group')
        .attr('transform', `translate(${-width / 2 + 20}, 80)`);

      stackGroup.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .attr('fill', '#a0aec0')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text('调用栈');

      currentStep.callStack.forEach((frame, index) => {
        const y = 20 + index * 28;
        const isTop = index === currentStep.callStack.length - 1;

        stackGroup.append('rect')
          .attr('x', 0)
          .attr('y', y)
          .attr('width', 140)
          .attr('height', 24)
          .attr('rx', 4)
          .attr('fill', isTop ? 'rgba(66, 153, 225, 0.3)' : 'rgba(45, 55, 72, 0.8)')
          .attr('stroke', isTop ? '#4299e1' : '#4a5568');

        stackGroup.append('text')
          .attr('x', 8)
          .attr('y', y + 16)
          .attr('fill', isTop ? '#63b3ed' : '#a0aec0')
          .attr('font-size', '11px')
          .text(`helper(${frame.left}, ${frame.right})`);
      });
    }

    // 绘制步骤说明
    if (currentStep) {
      const descGroup = g.append('g')
        .attr('class', 'description-group')
        .attr('transform', `translate(0, ${height / 2 - 60})`);

      descGroup.append('rect')
        .attr('x', -200)
        .attr('y', 0)
        .attr('width', 400)
        .attr('height', 40)
        .attr('rx', 8)
        .attr('fill', 'rgba(26, 26, 46, 0.95)')
        .attr('stroke', '#4a5568');

      descGroup.append('text')
        .attr('x', 0)
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f7fafc')
        .attr('font-size', '13px')
        .text(currentStep.description);
    }

  }, [currentStep, inputArray, transform, calculateLayout]);

  // 处理缩放和拖动
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        setTransform({
          x: event.transform.x,
          y: event.transform.y,
          scale: event.transform.k
        });
      });

    svg.call(zoom);

    return () => {
      svg.on('.zoom', null);
    };
  }, []);

  // 重置视图
  const handleReset = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  return (
    <div className="canvas-container" ref={containerRef}>
      <svg ref={svgRef} className="canvas-svg" />
      <div className="canvas-controls">
        <button className="control-btn" onClick={handleReset} title="重置视图">
          🔄
        </button>
        <button 
          className="control-btn" 
          onClick={() => setTransform(t => ({ ...t, scale: Math.min(t.scale * 1.2, 3) }))}
          title="放大"
        >
          ➕
        </button>
        <button 
          className="control-btn" 
          onClick={() => setTransform(t => ({ ...t, scale: Math.max(t.scale / 1.2, 0.3) }))}
          title="缩小"
        >
          ➖
        </button>
      </div>
      <div className="canvas-hint">
        拖动画布移动 · 滚轮缩放
      </div>
    </div>
  );
}
