import { usePageData } from '@rspress/runtime';
import { useEffect, useState } from 'react';
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
export default function ReadingProgress() {
  const pageData = usePageData();
  const route = getPageRoute(pageData, getBase(pageData));
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
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total <= 0 ? 100 : Math.min(100, Math.max(0, (window.scrollY / total) * 100)));
    };

    const updateActiveToc = () => {
      if (readingProgressConfig.showTocProgress === false) {
        for (const link of tocLinks) {
          link.classList.remove('editorial-reading-toc-active');
          link.removeAttribute('aria-current');
        }
        return;
      }

      const active = headings
        .filter((heading) => heading.getBoundingClientRect().top <= READING_HEADING_OFFSET)
        .at(-1)?.id;
      for (const link of tocLinks) {
        const selected = link.getAttribute('href')?.slice(1) === active;
        link.classList.toggle('editorial-reading-toc-active', selected);
        if (selected) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    };

    const saveCurrentPosition = () => {
      if (readingProgressConfig.rememberPosition !== true) return;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      if (window.scrollY >= total * 0.95) removePosition(positionKey);
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
            const total = document.documentElement.scrollHeight - window.innerHeight;
            if (total > 0) {
              window.scrollTo({ top: Math.min(storedPosition, total), behavior: 'auto' });
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
        link.classList.remove('editorial-reading-toc-active');
        link.removeAttribute('aria-current');
      }
      setPositionRestored(false);
    };
  }, [route, stats]);

  if (!readingProgressConfig.enabled || !stats) return null;

  const returnToTop = () => {
    removePosition(getPositionKey(route));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPositionRestored(false);
  };

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
          aria-label={t('editorial.readingProgress.label', 'Reading progress')}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      )}
      {readingProgressConfig.showReadingTime && (
        <div className="editorial-reading-time" aria-live="polite">
          {t('editorial.readingProgress.time', `${stats.readingTimeMinutes} min read`, {
            minutes: stats.readingTimeMinutes,
          })}{' '}
          · {Math.round(progress)}%
        </div>
      )}
      {positionRestored && (
        <output className="editorial-reading-restore">
          <span>{t('editorial.readingProgress.restored', 'Reading position restored')}</span>
          <button type="button" onClick={returnToTop}>
            {t('editorial.readingProgress.top', 'Back to top')}
          </button>
        </output>
      )}
    </>
  );
}
