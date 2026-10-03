export type SeoRegistryRow = {
  pageKey: string;
  urlPattern: string;
  robotsDefault: string;
  title: string;
  h1: string;
  description: string;
  targetIntent: string;
  contentGateRule: string;
  status: string;
};

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (quoted) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        current += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === ",") {
      cells.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current);
  return cells;
}

export function parseSeoRegistryCsv(raw: string): SeoRegistryRow[] {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length < 2) {
    throw new Error("SEO registry CSV is empty");
  }
  const header = splitCsvLine(lines[0]);
  const required = [
    "pageKey",
    "urlPattern",
    "robotsDefault",
    "title",
    "h1",
    "description",
    "targetIntent",
    "contentGateRule",
    "status",
  ];
  for (const name of required) {
    if (!header.includes(name)) {
      throw new Error(`SEO registry missing column ${name}`);
    }
  }
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row: Record<string, string> = {};
    header.forEach((name, index) => {
      row[name] = cells[index] ?? "";
    });
    return {
      pageKey: row.pageKey,
      urlPattern: row.urlPattern,
      robotsDefault: row.robotsDefault,
      title: row.title,
      h1: row.h1,
      description: row.description,
      targetIntent: row.targetIntent,
      contentGateRule: row.contentGateRule,
      status: row.status,
    };
  });
}
