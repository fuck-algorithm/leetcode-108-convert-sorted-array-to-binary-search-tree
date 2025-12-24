import { getGitHubStars, setGitHubStars } from './indexedDB';

const REPO_OWNER = 'fuck-algorithm';
const REPO_NAME = 'leetcode-108-convert-sorted-array-to-binary-search-tree';
const CACHE_DURATION = 60 * 60 * 1000; // 1小时

export const GITHUB_REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;

export async function fetchGitHubStars(): Promise<number> {
  try {
    // 检查缓存
    const cached = await getGitHubStars();
    if (cached && Date.now() - cached.lastFetched < CACHE_DURATION) {
      return cached.stars;
    }

    // 从 GitHub API 获取
    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`);
    
    if (!response.ok) {
      // 如果请求失败，返回缓存值或默认值
      return cached?.stars ?? 0;
    }

    const data = await response.json();
    const stars = data.stargazers_count || 0;

    // 保存到缓存
    await setGitHubStars(stars);

    return stars;
  } catch (error) {
    console.error('Failed to fetch GitHub stars:', error);
    // 尝试返回缓存值
    const cached = await getGitHubStars();
    return cached?.stars ?? 0;
  }
}
