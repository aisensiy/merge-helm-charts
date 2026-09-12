jest.mock("@actions/core", () => ({
  debug: jest.fn(),
  getInput: jest.fn(),
  info: jest.fn(),
  setFailed: jest.fn(),
}));

jest.mock("@actions/io", () => ({
  cp: jest.fn(),
  rmRF: jest.fn(),
}));

jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  existsSync: jest.fn(),
}));

function configureDirectoryMerge() {
  const core = jest.requireMock("@actions/core");
  const fs = jest.requireMock("fs");
  const io = jest.requireMock("@actions/io");

  core.getInput.mockImplementation((name: string) => {
    const inputs: Record<string, string> = {
      "source-path": "/source",
      "destination-path": "/destination",
      "merge-directories": "templates",
      "merge-yamls": "",
    };
    return inputs[name] || "";
  });
  fs.existsSync.mockReturnValue(true);

  return { core, io };
}

function configureYamlCopy() {
  const core = jest.requireMock("@actions/core");
  const fs = jest.requireMock("fs");
  const io = jest.requireMock("@actions/io");

  core.getInput.mockImplementation((name: string) => {
    const inputs: Record<string, string> = {
      "source-path": "/source",
      "destination-path": "/destination",
      "merge-directories": "",
      "merge-yamls": "values.yaml",
    };
    return inputs[name] || "";
  });
  fs.existsSync.mockImplementation(
    (filePath: string) =>
      filePath === "/source" || filePath === "/source/values.yaml"
  );

  return { core, io };
}

function flushPromises(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

describe("action entrypoint", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("waits for the destination removal before copying a directory", async () => {
    const { io } = configureDirectoryMerge();
    let finishRemoval: (() => void) | undefined;
    io.rmRF.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishRemoval = resolve;
        })
    );
    io.cp.mockResolvedValue(undefined);

    jest.requireActual("./main");

    expect(io.rmRF).toHaveBeenCalledWith("/destination/templates");
    expect(io.cp).not.toHaveBeenCalled();

    finishRemoval!();
    await flushPromises();

    expect(io.cp).toHaveBeenCalledTimes(1);
  });

  it("reports directory copy failures", async () => {
    const { core, io } = configureDirectoryMerge();
    const error = new Error("copy failed");
    io.rmRF.mockResolvedValue(undefined);
    io.cp.mockRejectedValue(error);

    jest.requireActual("./main");
    await flushPromises();

    expect(core.setFailed).toHaveBeenCalledWith(error);
  });

  it("reports YAML copy failures", async () => {
    const { core, io } = configureYamlCopy();
    const error = new Error("copy failed");
    io.cp.mockRejectedValue(error);

    jest.requireActual("./main");
    await flushPromises();

    expect(core.setFailed).toHaveBeenCalledWith(error);
  });
});
