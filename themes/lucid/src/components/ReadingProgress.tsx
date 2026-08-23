import { usePageData } from '@rspress/runtime';
import { useEffect, useState } from 'react';
import type React from 'react';
import { getReadingStats, readingProgressConfig } from 'virtual-reading-progress-data';

const READING_TOC_SELECTOR = '.rspress-toc-link[href^="#"]';
const READING_HEADING_SELECTOR = 'h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]';
const READING_HEADING_OFFSET = 120;

function getCurrentRoute(pathname: string, base: string): string {
  const withoutBase = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  const route = decodeURIComponent(withoutBase)
    .replace(/^\/+|\/+$/g, '')
    .replace(/\.html$/, '');

  return route ? `/${route}` : '/';
}

/** 在文章页显示阅读进度条和预计阅读时间。 */
const ReadingProgress: React.FC = () => {
  const pageData = usePageData();
  const base = (pageData?.siteData?.base || '').replace(/\/$/, '');
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const route = getCurrentRoute(pathname, base);
  const stats = getReadingStats(route);
  const [progress, setProgress] = useState(0);
  const [activeHeadingId, setActiveHeadingId] = useState<string>();

  useEffect(() => {
    if (!stats || typeof window === 'undefined' || typeof document === 'undefined') return;

    const tocLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>(READING_TOC_SELECTOR));
    const tocHeadingIds = new Set(
      tocLinks
        .map((link) => link.getAttribute('href')?.slice(1))
        .filter((headingId): headingId is string => Boolean(headingId))
    );
    const headings = Array.from(
      document.querySelectorAll<HTMLElement>(READING_HEADING_SELECTOR)
    ).filter((heading) => tocHeadingIds.has(heading.id));

    const updateProgress = () => {
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress =
        documentHeight <= 0
          ? 100
          : Math.min(100, Math.max(0, (window.scrollY / documentHeight) * 100));
      setProgress(nextProgress);

      const activeHeading = headings
        .filter((heading) => heading.getBoundingClientRect().top <= READING_HEADING_OFFSET)
        .at(-1);
      setActiveHeadingId(activeHeading?.id || headings[0]?.id);
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
    if (!stats || typeof document === 'undefined') return;

    const tocLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>(READING_TOC_SELECTOR));
    for (const link of tocLinks) {
      const isActive = link.getAttribute('href')?.slice(1) === activeHeadingId;
      link.classList.toggle('cogita-reading-toc-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    }
  }, [activeHeadingId, stats]);

  if (
    !readingProgressConfig.enabled ||
    !stats ||
    (!readingProgressConfig.showBar && !readingProgressConfig.showReadingTime)
  ) {
    return null;
  }

  return (
    <>
      {readingProgressConfig.showBar && (
        <div
          className="cogita-reading-progress"
          role="progressbar"
          tabIndex={-1}
          aria-label="文章阅读进度"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="cogita-reading-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}
      {readingProgressConfig.showReadingTime && (
        <div className="cogita-reading-time" aria-live="polite">
          <span>预计 {stats.readingTimeMinutes} 分钟阅读</span>
          <span aria-hidden="true">·</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
    </>
  );
};

export default ReadingProgress;
