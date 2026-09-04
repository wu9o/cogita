/// <reference path="./types.d.ts" />

import React, { useState } from 'react';
import { getLocale, setLocale, supportedLocales, t } from 'virtual-cogita-i18n-text';

const localeLabels: Record<string, string> = {
  'en-US': 'English',
  'zh-CN': '中文',
};

/** 在启用多个语言字典时提供全站语言切换。 */
export default function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState(getLocale);

  if (supportedLocales.length < 2) return null;

  return (
    <div
      aria-label={t('i18n.switcher.label', 'Language')}
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000,
        display: 'inline-flex',
        gap: 2,
        padding: 3,
        border: '1px solid var(--cogita-i18n-border, #e4e8f0)',
        borderRadius: 999,
        background: 'var(--cogita-i18n-surface, rgba(255, 255, 255, 0.92))',
        boxShadow: '0 8px 24px rgba(29, 48, 91, 0.08)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {supportedLocales.map((supportedLocale) => {
        const active = supportedLocale === currentLocale;
        return (
          <button
            key={supportedLocale}
            type="button"
            aria-pressed={active}
            onClick={() => {
              setCurrentLocale(supportedLocale);
              setLocale(supportedLocale);
            }}
            style={{
              minHeight: 28,
              padding: '0 9px',
              border: 0,
              borderRadius: 999,
              background: active ? 'var(--cogita-i18n-accent, #315efb)' : 'transparent',
              color: active ? '#fff' : 'var(--cogita-i18n-text, #172033)',
              cursor: 'pointer',
              font: 'inherit',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {localeLabels[supportedLocale] || supportedLocale}
          </button>
        );
      })}
    </div>
  );
}
