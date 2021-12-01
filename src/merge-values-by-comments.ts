type TopItem = {
  name: string;
  lineRange: [number, number];
  lines: string[];
  isNonBlock: boolean;
};

const startBlockPattern = /^#+.*BEGIN.* +([\w-]+).*$/i;
const endBlockPattern = /^#+.*END.* +([\w-]+).*$/;

export function locateRootKeyRanges(lines: string[]): TopItem[] {
  const topItems: TopItem[] = [];

  let currentTopItem: TopItem | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.replace(/\s+$/, "");
    // match end block
    const endBlockMatch = endBlockPattern.exec(trimmedLine);
    if (endBlockMatch) {
      if (!currentTopItem) {
        throw new Error(`Unexpected end block: ${line}`);
      }
      if (endBlockMatch[1] !== currentTopItem.name) {
        throw new Error(`Unexpected end block: ${line}`);
      }
      currentTopItem.lineRange[1] = i;
      topItems.push(currentTopItem);
      currentTopItem = null;
      continue;
    }
    const startBlockMatch = startBlockPattern.exec(trimmedLine);
    // match start block
    if (startBlockMatch) {
      if (currentTopItem) {
        currentTopItem.lineRange[1] = currentTopItem.isNonBlock ? i - 1 : i;
        topItems.push(currentTopItem);
      }
      currentTopItem = {
        name: startBlockMatch[1],
        lineRange: [i, i],
        lines: [],
        isNonBlock: false,
      };
      continue;
    }

    // if not start and no current top item, then init a non block item
    if (!startBlockMatch && !currentTopItem) {
      currentTopItem = {
        name: "",
        lineRange: [i, i],
        lines: [],
        isNonBlock: true,
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
    if (item.isNonBlock) {
      continue;
    }
    sourceKeys.set(item.name, item);
  }

  // get target items keys as a ordered Map
  const targetKeys = new Map<string, TopItem>();
  for (const item of targetItems) {
    if (item.isNonBlock) {
      continue;
    }
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
  for (const item of targetItems) {
    if (item.isNonBlock) {
      mergedItems.push(item);
      continue;
    }
    // if the key is in both maps, then push source item
    if (commonKeys.has(item.name)) {
      mergedItems.push(sourceKeys.get(item.name)!);
    } else {
      mergedItems.push(item);
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
