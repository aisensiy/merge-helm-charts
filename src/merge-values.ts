type TopItem = {
  name: string;
  lineRange: [number, number];
  lines: string[];
};

export function locateRootKeyRanges(lines: string[]): TopItem[] {
  const topItems: TopItem[] = [];

  let currentTopItem: TopItem | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.replace(/\s+$/, "");
    // line match regex
    if (trimmedLine.match(/^[^\s].*:$/)) {
      // if there is a current top item, add it to the list
      if (currentTopItem) {
        currentTopItem.lineRange[1] = i - 1;
        topItems.push(currentTopItem);
      }
      // create a new top item
      currentTopItem = {
        name: trimmedLine.replace(/:$/, ""),
        lineRange: [i, 0],
        lines: [],
      };
    }
  }

  // if there is a current top item, add it to the list
  if (currentTopItem) {
    currentTopItem.lineRange[1] = lines.length - 1;
    topItems.push(currentTopItem);
  }

  // assign lines to top items
  for (const topItem of topItems) {
    topItem.lines = lines.slice(topItem.lineRange[0], topItem.lineRange[1] + 1);
  }

  return topItems;
}

export default function mergeStrings(
  sources: string[],
  targets: string[]
): string[] {
  const sourceItems = locateRootKeyRanges(sources);
  const targetItems = locateRootKeyRanges(targets);

  // get source items keys as a ordered map
  const sourceKeys = new Map<string, TopItem>();
  for (const item of sourceItems) {
    sourceKeys.set(item.name, item);
  }

  // get target items keys as a ordered Map
  const targetKeys = new Map<string, TopItem>();
  for (const item of targetItems) {
    targetKeys.set(item.name, item);
  }

  // get the keys that are in both maps
  const commonKeys = new Set<string>();
  for (const key of sourceKeys.keys()) {
    if (targetKeys.has(key)) {
      commonKeys.add(key);
    }
  }

  const mergedItems: TopItem[] = [];
  for (const key of targetKeys.keys()) {
    if (commonKeys.has(key)) {
      mergedItems.push(sourceKeys.get(key)!);
    } else {
      mergedItems.push(targetKeys.get(key)!);
    }
  }
  // add the remaining source items
  for (const key of sourceKeys.keys()) {
    if (!commonKeys.has(key)) {
      mergedItems.push(sourceKeys.get(key)!);
    }
  }

  // merge lines
  const mergedLines: string[] = [];
  for (const item of mergedItems) {
    mergedLines.push(...item.lines);
  }

  return mergedLines;
}
