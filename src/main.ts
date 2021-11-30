import * as core from "@actions/core";
import * as io from "@actions/io";
import * as fs from "fs";
import * as path from "path";
import { inspect } from "util";

import mergeStrings from "./merge-values-by-comments";


function readYamlFileIgnorePostfix(filePath: string, ignoreNotFound: boolean = true): string {
  // get postfix of file
  const postfix = path.extname(filePath);
  // remove postfix
  const filePathWithoutPostfix = filePath.slice(0, -postfix.length);
  const condidateFilePaths = [`${filePathWithoutPostfix}.yml`, `${filePathWithoutPostfix}.yaml`];
  for (const condidateFilePath of condidateFilePaths) {
    if (fs.existsSync(condidateFilePath)) {
      return fs.readFileSync(condidateFilePath, "utf8");
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
    core.info(
      `Keep ${targetFilePath} unchanged or ignore if not exists`
    );
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
    fs.writeFileSync(targetFilePath, mergedLines.join("\n") + "\n");
    core.info(`Merged ${sourceFilePath} to ${targetFilePath}`);
  }
}

async function run() {
  const inputs = {
    sourcePath: core.getInput("source-path"),
    destinationPath: core.getInput("destination-path"),
  };
  core.debug(`Inputs: ${inspect(inputs)}`);

  // if source path exists copy templates folder to destination path
  const sourcePath = inputs.sourcePath;
  const destinationPath = inputs.destinationPath;
  if (fs.existsSync(sourcePath)) {
    // remove files in destination path
    io.rmRF(path.join(destinationPath, "templates"));
    // copy source path to destination path
    io.cp(path.join(sourcePath, 'templates'), destinationPath, { recursive : true, force: true });
    core.info(`Replace ${destinationPath}/templates to ${sourcePath}/templates`);

    // merge files
    const sourceFilePath = path.join(sourcePath, "values.yaml");
    const targetFilePath = path.join(destinationPath, "values.yaml");
    mergeFile(readYamlFileIgnorePostfix(sourceFilePath), readYamlFileIgnorePostfix(targetFilePath));

    const sourceFilePath2 = path.join(sourcePath, "questions.yaml");
    const targetFilePath2 = path.join(destinationPath, "values.yaml.template");
    mergeFile(readYamlFileIgnorePostfix(sourceFilePath2), readYamlFileIgnorePostfix(targetFilePath2));
  } else {
    core.info(`Source path ${sourcePath} does not exist`);
  }
}

run();
