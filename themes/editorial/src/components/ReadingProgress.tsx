import { usePageData } from '@rspress/runtime';
import { useEffect, useState } from 'react';
import { getReadingStats, readingProgressConfig } from 'virtual-reading-progress-data';
import { getBase, getCurrentRoute } from '../utils';

const TOC_LINK_SELECTOR = '.rspress-toc-link[href^="#"]';

/** 在文章页显示轻量阅读进度，不改变首页和索引页的布局。 */
export default function ReadingProgress() {
  const pageData = usePageData();
  const route = getCurrentRoute(getBase(pageData));
  const stats = getReadingStats(route);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!stats) return;

    const updateProgress = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total <= 0 ? 100 : Math.min(100, Math.max(0, (window.scrollY / total) * 100)));
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [stats]);

  useEffect(() => {
    if (!stats) return;
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(TOC_LINK_SELECTOR));
    const updateActiveLink = () => {
      const headings = Array.from(document.querySelectorAll<HTMLElement>('h1[id], h2[id], h3[id]'));
      const active = headings
        .filter((heading) => heading.getBoundingClientRect().top <= 140)
        .at(-1)?.id;
      for (const link of links) {
        const selected = link.getAttribute('href')?.slice(1) === active;
        link.classList.toggle('editorial-reading-toc-active', selected);
        if (selected) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    };

    updateActiveLink();
    window.addEventListener('scroll', updateActiveLink, { passive: true });
    return () => window.removeEventListener('scroll', updateActiveLink);
  }, [stats]);

  if (!readingProgressConfig.enabled || !stats) return null;

  return (
    <>
      {readingProgressConfig.showBar && (
        <div
          className="editorial-reading-progress"
          role="progressbar"
          tabIndex={-1}
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="文章阅读进度"
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      )}
      {readingProgressConfig.showReadingTime && (
        <div className="editorial-reading-time">
          预计 {stats.readingTimeMinutes} 分钟阅读 · {Math.round(progress)}%
        </div>
      )}
    </>
  );
}
