import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('project setup', () => {
  it('keeps required local development scripts available', () => {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    for (const name of ['dev', 'typecheck', 'test', 'build']) expect(pkg.scripts[name]).toBeTruthy();
  });
});
