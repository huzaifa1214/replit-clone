export enum Type {
  FILE,
  DIRECTORY,
  DUMMY,
}

export interface RemoteFile {
  type: "file" | "dir";
  name: string;
  path: string;
}

interface CommonProps {
  id: string;
  type: Type;
  name: string;
  content?: string;
  path: string;
  parentId: string | undefined;
  depth: number;
}

export interface File extends CommonProps {}

export interface Directory extends CommonProps {
  files: File[];
  dirs: Directory[];
}

export function sortFile(a: File, b: File) {
  return a.name.localeCompare(b.name);
}

export function sortDir(a: Directory, b: Directory) {
  return a.name.localeCompare(b.name);
}

export function findFileByName(
  rootDir: Directory,
  fileName: string
): File | undefined {
  let targetFile: File | undefined = undefined;

  function findFile(rootDir: Directory, fileName: string) {
    rootDir.files.map((file) => {
      if (file.name === fileName) {
        targetFile = file;
        return;
      }
    });
    rootDir.dirs.map((dir) => findFile(dir, fileName));
  }
  findFile(rootDir, fileName);
  return targetFile;
}

function getDepth(rootDir: Directory, currentDepth: number) {
  rootDir.files.map((file) => (file.depth = currentDepth++));
  rootDir.dirs.map((dir) => {
    dir.depth = currentDepth++;
    getDepth(dir, currentDepth);
  });
}

export function buildFileTree(data: RemoteFile[]): Directory {
  const dirs = data.filter((file) => file.type === "dir");
  const files = data.filter((file) => file.type === "file");
  const cache = new Map<string, Directory | File>();
  const rootDir: Directory = {
    id: "root",
    type: Type.DIRECTORY,
    name: "root",
    path: "root",
    parentId: undefined,
    depth: 0,
    files: [],
    dirs: [],
  };

  dirs.forEach((dir) => {
    const newDir: Directory = {
      id: dir.path,
      type: Type.DIRECTORY,
      name: dir.name,
      path: dir.path,
      parentId:
        dir.path.split("/").length === 2
          ? "0"
          : dir.path.split("/").slice(0, -1).join("/"),
      depth: 0,
      files: [],
      dirs: [],
    };
    cache.set(newDir.id, newDir);
  });
  files.forEach((file) => {
    const newFile: File = {
      id: file.path,
      type: Type.FILE,
      name: file.name,
      path: file.path,
      parentId:
        file.path.split("/").length === 2
          ? "0"
          : file.path.split("/").slice(0, -1).join("/"),
      depth: 0,
    };
    cache.set(newFile.id, newFile);
  });
  getDepth(rootDir, 0);
  return rootDir;
}
