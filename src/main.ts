import * as core from "@actions/core";
import * as io from "@actions/io";
import * as fs from "fs";
import * as path from "path";
import * as utils from "./utils";
import { inspect } from "util";

import mergeStrings from "./merge-values-by-comments";

function readYamlFileIgnorePostfix(
  filePath: string,
  ignoreNotFound: boolean = true
): string {
  // get postfix of file
  const postfix = path.extname(filePath);
  // remove postfix
  const filePathWithoutPostfix = filePath.slice(0, -postfix.length);
  const condidateFilePaths = [
    `${filePathWithoutPostfix}.yml`,
    `${filePathWithoutPostfix}.yaml`,
  ];
  for (const condidateFilePath of condidateFilePaths) {
    if (fs.existsSync(condidateFilePath)) {
      return condidateFilePath;
    }
  }

  if (ignoreNotFound) {
    return condidateFilePaths[condidateFilePaths.length - 1];
  } else {
    throw new Error(`File ${filePathWithoutPostfix}* does not exist`);
  }
}

function mergeFile(sourceFilePath: string, targetFilePath: string) {
  // if source file does not exist
  const hasSourceFile = fs.existsSync(sourceFilePath);
  const hasDestinationFile = fs.existsSync(targetFilePath);
  if (hasSourceFile && !hasDestinationFile) {
    // copy source file to destination file
    io.cp(sourceFilePath, targetFilePath);
    core.info(`Copied ${sourceFilePath} to ${targetFilePath}`);
    return;
  }
  if (!hasSourceFile) {
    core.info(`Keep ${targetFilePath} unchanged or ignore if not exists`);
    return;
  }
  if (hasSourceFile && hasDestinationFile) {
    // read source file
    const sourceFile = fs.readFileSync(sourceFilePath, "utf8");
    // get lines of source file
    const sourceLines = sourceFile.split("\n");
    // read destination file
    const destinationFile = fs.readFileSync(targetFilePath, "utf8");
    // get lines of destination file
    const destinationLines = destinationFile.split("\n");
    // merge lines
    const mergedLines = mergeStrings(sourceLines, destinationLines);
    // write merged lines to destination file
    fs.writeFileSync(targetFilePath, mergedLines.join("\n").trim() + "\n");
    core.info(`Merged ${sourceFilePath} to ${targetFilePath}`);
  }
}

function mergeDirectory(sourcePath: string, targetPath: string) {
  // remove files in destination path
  io.rmRF(targetPath);
  // copy source path to target path
  const parentPath = path.dirname(targetPath);
  io.cp(sourcePath, parentPath, { recursive: true, force: true });
  core.info(`Replace ${targetPath} by ${sourcePath}`);
}

async function run() {
  const inputs = {
    sourcePath: core.getInput("source-path"),
    destinationPath: core.getInput("destination-path"),
    mergeYamls: utils.getInputAsArray("merge-yamls"),
    mergeDirectories: utils.getInputAsArray("merge-directories"),
  };
  core.debug(`Inputs: ${inspect(inputs)}`);

  // if source path exists copy templates folder to destination path
  const sourcePath = inputs.sourcePath;
  const destinationPath = inputs.destinationPath;
  if (fs.existsSync(sourcePath)) {
    for (const directory of inputs.mergeDirectories) {
      mergeDirectory(
        path.join(sourcePath, directory),
        path.join(destinationPath, directory)
      );
    }

    for (const yaml of inputs.mergeYamls) {
      const sourceFilePath = readYamlFileIgnorePostfix(
        path.join(sourcePath, yaml)
      );
      const targetFilePath = path.join(destinationPath, yaml);
      mergeFile(
        readYamlFileIgnorePostfix(sourceFilePath),
        readYamlFileIgnorePostfix(targetFilePath)
      );
    }
  } else {
    core.info(`Source path ${sourcePath} does not exist`);
  }
}

run();
