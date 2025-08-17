import { fileURLToPath } from 'node:url';
import { findUp } from 'find-up';
import jiti from 'jiti';
import type { CogitaConfig } from '../types';

const CONFIG_FILES = ['cogita.config.ts', 'cogita.config.js', 'cogita.config.mjs'];

export async function loadConfig(root: string = process.cwd()): Promise<CogitaConfig> {
  const configPath = await findUp(CONFIG_FILES, { cwd: root });

  if (!configPath) {
    return {};
  }

  try {
    const _require = jiti(fileURLToPath(import.meta.url));
    const mod = _require(configPath);
    return mod.default || {};
  } catch (e) {
    console.error(`Failed to load config file: ${configPath}`);
    throw e;
  }
}
