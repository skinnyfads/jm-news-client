const DEFAULT_API_URL = "http://localhost:8080";

const baseUrl = (process.env.NEXT_PUBLIC_TEXT_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, "");

export interface TextRecord {
  id: number;
  text: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

interface ListTextsResponse {
  texts: TextRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

interface GetTextResponse {
  text: TextRecord;
}

export interface AnalyzeToken {
  surface: string;
  dictForm: string | null;
  reading: string | null;
  meanings: string[];
  pos: string[];
  reason: string | null;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return [value];
  }
  return [];
}

function normalizeToken(raw: unknown): AnalyzeToken | null {
  if (!raw || typeof raw !== "object") return null;

  const token = raw as Record<string, unknown>;
  const nestedToken =
    token.vocabulary && typeof token.vocabulary === "object"
      ? (token.vocabulary as Record<string, unknown>)
      : null;

  const surfaceValue =
    token.surface ??
    token.text ??
    token.token ??
    token.word ??
    token.form;
  if (typeof surfaceValue !== "string" || surfaceValue.length === 0) {
    return null;
  }

  const dictFormValue =
    token.dictForm ??
    token.dictionaryForm ??
    token.lemma ??
    token.base ??
    token.baseForm ??
    nestedToken?.dictForm ??
    nestedToken?.dictionaryForm;
  const readingValue =
    token.reading ??
    token.pronunciation ??
    token.kana ??
    nestedToken?.reading;
  const meaningsValue =
    token.meanings ??
    token.englishMeaning ??
    token.gloss ??
    token.glosses ??
    token.definition ??
    nestedToken?.meanings ??
    nestedToken?.englishMeaning;
  const posValue = token.pos ?? token.partOfSpeech ?? token.tag;
  const reasonValue = token.reason;

  return {
    surface: surfaceValue,
    dictForm: typeof dictFormValue === "string" ? dictFormValue : null,
    reading: typeof readingValue === "string" ? readingValue : null,
    meanings: toStringArray(meaningsValue),
    pos: toStringArray(posValue),
    reason: typeof reasonValue === "string" ? reasonValue : null,
  };
}

function collectPossibleTokenArrays(data: unknown): unknown[][] {
  const arrays: unknown[][] = [];
  const stack: unknown[] = [data];
  const visited = new Set<object>();

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    if (Array.isArray(current)) {
      arrays.push(current);
      for (const item of current) stack.push(item);
      continue;
    }

    if (typeof current !== "object") continue;
    if (visited.has(current)) continue;
    visited.add(current);

    const record = current as Record<string, unknown>;
    for (const value of Object.values(record)) {
      stack.push(value);
    }
  }

  return arrays;
}

function normalizeAnalyzeTokens(data: unknown): AnalyzeToken[] {
  const possibleArrays = collectPossibleTokenArrays(data);
  const source =
    possibleArrays.find((arr) => arr.some((item) => normalizeToken(item) !== null)) ?? [];

  return source
    .map(normalizeToken)
    .filter((token): token is AnalyzeToken => token !== null);
}

export async function fetchTexts(page: number, limit: number): Promise<ListTextsResponse> {
  const res = await fetch(`${baseUrl}/texts?page=${page}&limit=${limit}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch texts");
  }
  return res.json();
}

export async function fetchTextById(id: string): Promise<TextRecord | null> {
  const res = await fetch(`${baseUrl}/texts/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    return null;
  }
  const data: GetTextResponse = await res.json();
  return data.text;
}

export async function analyzeText(language: string, text: string): Promise<AnalyzeToken[]> {
  const res = await fetch(`${baseUrl}/analyze/${encodeURIComponent(language)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to analyze text");
  }

  const data = await res.json();
  return normalizeAnalyzeTokens(data);
}
