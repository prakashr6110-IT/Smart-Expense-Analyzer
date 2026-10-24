/**
 * TEMPORARY deployment diagnostic — proves whether Vercel injected the
 * environment variable into the running production function. It reports lengths
 * and formatting problems only, never the secret itself.
 *
 * Delete api/_diag.js once the AI chat works.
 */
export const runtime = 'nodejs20.x';

const TARGET = 'OLLAMA_API_KEY';

/** Describe a value without exposing it. */
function inspect(value) {
  if (value === undefined) return { state: 'MISSING (key not present in process.env)' };

  const wrapped = /^["'].*["']$/.test(value);
  const padded = value !== value.trim();

  return {
    state: value.length === 0 ? 'EMPTY STRING' : 'present',
    length: value.length,
    startsWith: value.slice(0, 4),
    endsWith: value.slice(-2),
    hasSurroundingQuotes: wrapped,
    hasLeadingOrTrailingWhitespace: padded,
    hasInternalWhitespace: /\s/.test(value.trim()),
  };
}

export default async function handler(_req, res) {
  const names = Object.keys(process.env)
    .filter((n) => !/^(PATH|HOME|TMPDIR|NODE|LANG|SHELL|PWD|OLDPWD|SHLVL|_|LC_|TZ|TERM)/.test(n))
    .sort();

  res.status(200).json({
    target: TARGET,
    value: inspect(process.env[TARGET]),
    ollamaRelatedNames: names.filter((n) => /OLLAMA|API_KEY|TOKEN|SECRET/i.test(n)),
    allEnvNames: names,
    envCount: names.length,
    vercelEnv: process.env.VERCEL_ENV || 'unknown',
    vercelRegion: process.env.VERCEL_REGION || 'unknown',
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'unknown',
  });
}
