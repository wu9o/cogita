import { usePageData } from '@rspress/runtime';
import { useEffect, useState } from 'react';
import type React from 'react';
import { getReadingStats, readingProgressConfig } from 'virtual-reading-progress-data';
import { t } from '../i18n';
import { getBase, getPageRoute } from '../utils';

const READING_TOC_SELECTOR = '.rspress-toc-link[href^="#"], .aside-link[href^="#"]';
const READING_HEADING_SELECTOR = 'h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]';
const READING_HEADING_OFFSET = 120;
const READING_POSITION_PREFIX = 'cogita-reading-position:';

function getPositionKey(route: string): string {
  return `${READING_POSITION_PREFIX}${encodeURIComponent(route)}`;
}

function readPosition(key: string): number | undefined {
  try {
    const value = Number(window.localStorage.getItem(key));
    return Number.isFinite(value) && value > 80 ? value : undefined;
  } catch {
    return undefined;
  }
}

function removePosition(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // 浏览器禁用本地存储时，阅读功能仍然可以继续使用
  }
}

function savePosition(key: string, position: number): void {
  try {
    window.localStorage.setItem(key, String(Math.round(position)));
  } catch {
    // 浏览器禁用本地存储时，忽略位置记忆失败
  }
}

/** 在文章页显示阅读进度、目录联动和可选的阅读位置记忆。 */
const ReadingProgress: React.FC = () => {
  const pageData = usePageData();
  const base = getBase(pageData);
  const route = getPageRoute(pageData, base);
  const stats = getReadingStats(route);
  const [progress, setProgress] = useState(0);
  const [positionRestored, setPositionRestored] = useState(false);

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
    const positionKey = getPositionKey(route);
    let saveTimer: number | undefined;
    let restoreFrame: number | undefined;

    const updateProgress = () => {
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress =
        documentHeight <= 0
          ? 100
          : Math.min(100, Math.max(0, (window.scrollY / documentHeight) * 100));
      setProgress(nextProgress);
    };

    const updateActiveToc = () => {
      if (readingProgressConfig.showTocProgress === false) {
        for (const link of tocLinks) {
          link.classList.remove('cogita-reading-toc-active');
          link.removeAttribute('aria-current');
        }
        return;
      }

      const activeHeading = headings
        .filter((heading) => heading.getBoundingClientRect().top <= READING_HEADING_OFFSET)
        .at(-1);
      const activeHeadingId = activeHeading?.id || headings[0]?.id;
      for (const link of tocLinks) {
        const isActive = link.getAttribute('href')?.slice(1) === activeHeadingId;
        link.classList.toggle('cogita-reading-toc-active', isActive);
        if (isActive) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    };

    const saveCurrentPosition = () => {
      if (readingProgressConfig.rememberPosition !== true) return;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (documentHeight <= 0) return;
      if (window.scrollY >= documentHeight * 0.95) removePosition(positionKey);
      else savePosition(positionKey, window.scrollY);
    };

    const onScroll = () => {
      updateProgress();
      updateActiveToc();
      if (readingProgressConfig.rememberPosition === true) {
        if (saveTimer) window.clearTimeout(saveTimer);
        saveTimer = window.setTimeout(saveCurrentPosition, 250);
      }
    };

    updateProgress();
    updateActiveToc();

    if (readingProgressConfig.rememberPosition === true && !window.location.hash) {
      const storedPosition = readPosition(positionKey);
      if (storedPosition !== undefined) {
        restoreFrame = window.requestAnimationFrame(() => {
          restoreFrame = window.requestAnimationFrame(() => {
            const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (documentHeight > 0) {
              window.scrollTo({ top: Math.min(storedPosition, documentHeight), behavior: 'auto' });
              setPositionRestored(true);
              updateProgress();
              updateActiveToc();
            }
          });
        });
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      saveCurrentPosition();
      if (saveTimer) window.clearTimeout(saveTimer);
      if (restoreFrame) window.cancelAnimationFrame(restoreFrame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateProgress);
      for (const link of tocLinks) {
        link.classList.remove('cogita-reading-toc-active');
        link.removeAttribute('aria-current');
      }
      setPositionRestored(false);
    };
  }, [route, stats]);

  if (
    !readingProgressConfig.enabled ||
    !stats ||
    (!readingProgressConfig.showBar && !readingProgressConfig.showReadingTime)
  ) {
    return null;
  }

  const returnToTop = () => {
    removePosition(getPositionKey(route));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPositionRestored(false);
  };

  return (
    <>
      {readingProgressConfig.showBar && (
        <div
          className="cogita-reading-progress"
          role="progressbar"
          tabIndex={-1}
          aria-label={t('lucid.readingProgress.label', 'Reading progress')}
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="cogita-reading-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}
      {readingProgressConfig.showReadingTime && (
        <div className="cogita-reading-time" aria-live="polite">
          <span>
            {t('lucid.readingProgress.time', `${stats.readingTimeMinutes} min read`, {
              minutes: stats.readingTimeMinutes,
            })}
          </span>
          <span aria-hidden="true">·</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      {positionRestored && (
        <output className="cogita-reading-restore">
          <span>{t('lucid.readingProgress.restored', 'Reading position restored')}</span>
          <button type="button" onClick={returnToTop}>
            {t('lucid.readingProgress.top', 'Back to top')}
          </button>
        </output>
      )}
    </>
  );
};

export default ReadingProgress;
