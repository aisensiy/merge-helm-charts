import * as fs from "fs";

import mergeStrings from "./merge-values";

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

  expect(merged).toEqual(expected);
}

describe("merge-values", () => {
  it("overwrite keys", () => {
    testMergeStrings(
      "./src/fixtures/source1.yaml",
      "./src/fixtures/target1.yaml",
      "./src/fixtures/result1.yaml"
    );
  });
  it("integration test", () => {
    testMergeStrings(
      "./src/fixtures/source2.yaml",
      "./src/fixtures/target2.yaml",
      "./src/fixtures/result2.yaml"
    );
  });
});
