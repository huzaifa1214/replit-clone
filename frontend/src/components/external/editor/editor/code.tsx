import Editor from "@monaco-editor/react";
import { File } from "../utils/file-manager";
import { Socket } from "socket.io-client";

const Code = ({
  selectedFile,
  socket,
}: {
  selectedFile: File | undefined;
  socket: Socket;
}) => {
  if (!selectedFile) return null;

  function debounce(func: (value: string | undefined) => void, wait: number) {
    let timeout: number;
    return (value: string | undefined) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(value);
      }, wait);
    };
  }

  let language = selectedFile.name.split(".").pop();
  if (language === "py") language = "python";
  else if (language === "ts") language = "typescript";
  else if (language === "js") language = "javascript";

  3;
  return (
    <Editor
      height="100vh"
      language={language}
      value={selectedFile.content}
      theme="vs-dark"
      onChange={debounce((value) => {
        socket.emit("updateContent", {
          path: selectedFile.path,
          content: value,
        });
      }, 500)}
    />
  );
};

export default Code;
