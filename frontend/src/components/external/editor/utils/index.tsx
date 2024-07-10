import { useEffect } from "react";
import { Directory, buildFileTree } from "./file-manager";

export const useFilesFromSandbox = (
  id: string,
  callback: (dir: Directory) => void
) => {
  useEffect(() => {
    fetch("https://codesandbox.io/api/v1/sandboxes/" + id)
      .then((res) => res.json())
      .then(({ data }) => {
        const rootDir = buildFileTree(data.files);
        callback(rootDir);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
