import * as fs from "fs";

import mergeStrings, { locateRootKeyRanges } from "./merge-values-by-comments";

function testMergeStrings(
  sourceFile: string,
  targetFile: string,
  expectedFile: string
) {
  const source = fs.readFileSync(sourceFile, "utf8");
  const target = fs.readFileSync(targetFile, "utf8");
  const expected = fs.readFileSync(expectedFile, "utf8");

  const merged = mergeStrings(source.split("\n"), target.split("\n")).join(
    "\n"
  );

  expect(merged.trim()).toEqual(expected.trim());
}

describe("locat top ranges", () => {
  it("should locate top ranges", () => {
    const items = locateRootKeyRanges(fs.readFileSync("./src/fixtures/source3.yaml", "utf8").split("\n"));
    expect(items.length).toEqual(4);
  });
});

describe("merge-values", () => {
  it("integration test", () => {
    testMergeStrings(
      "./src/fixtures/source3.yaml",
      "./src/fixtures/target3.yaml",
      "./src/fixtures/result3.yaml"
    );
  });
});
