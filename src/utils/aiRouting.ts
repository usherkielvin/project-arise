type AiTargetTab = '/(tabs)/quests' | '/(tabs)/habits' | '/(tabs)/journal' | '/(tabs)/terminal';

export function resolveAiTargetTab(prompt: string): AiTargetTab {
  const lower = prompt.toLowerCase();
  if (lower.includes('habit')) return '/(tabs)/habits';
  if (lower.includes('journal') || lower.includes('log')) return '/(tabs)/journal';
  if (lower.includes('trade') || lower.includes('terminal') || lower.includes('xau') || lower.includes('btc')) {
    return '/(tabs)/terminal';
  }
  return '/(tabs)/quests';
}

export function normalizeQuestPrompt(prompt: string): { title: string; description: string } {
  const text = prompt.trim();
  const cleaned = text
    .replace(/^create\s+quest\s*[:\-]?\s*/i, '')
    .replace(/^new\s+quest\s*[:\-]?\s*/i, '')
    .trim();
  const [titleCandidate, ...descParts] = cleaned.split(/[.!?]/);
  return {
    title: (titleCandidate || cleaned || text).trim(),
    description: descParts.join('. ').trim(),
  };
}

export function normalizeHabitPrompt(prompt: string): string {
  const text = prompt.trim();
  return text
    .replace(/^create\s+habit\s*[:\-]?\s*/i, '')
    .replace(/^new\s+habit\s*[:\-]?\s*/i, '')
    .trim() || text;
}
