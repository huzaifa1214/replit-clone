import styled from "@emotion/styled";
import { Directory, File, sortFile, sortDir } from "../utils/file-manager";
import { Fragment, useState } from "react";
import { getIcon } from "./icon";

export const FileTree = ({
  rootDir,
  selectedFile,
  onSelect,
}: {
  rootDir: Directory;
  selectedFile: File | undefined;
  onSelect: (file: File) => void;
}) => {
  return (
    <SubTree
      directory={rootDir}
      selectedFile={selectedFile}
      onSelect={onSelect}
    />
  );
};

export const DirDiv = ({
  directory,
  selectedFile,
  onSelect,
}: {
  directory: Directory;
  selectedFile: File | undefined;
  onSelect: (file: File) => void;
}) => {
  let defaultOpen = false;
  if (selectedFile) defaultOpen = isChildSelected({ directory, selectedFile });
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <FileDiv
        file={directory}
        selectedFile={selectedFile}
        onClick={() => {
          if (!open) onSelect(directory);
          setOpen(!open);
        }}
      />
      {open && (
        <SubTree
          directory={directory}
          selectedFile={selectedFile}
          onSelect={onSelect}
        />
      )}
    </>
  );
};

const FileDiv = ({
  file,
  selectedFile,
  onClick,
}: {
  file: File;
  selectedFile: File | undefined;
  onClick: () => void;
}) => {
  const isSelected = (selectedFile && file.id === selectedFile.id) as boolean;
  const depth = file.depth;
  return (
    <Div depth={depth} onClick={onClick} isSelected={isSelected}>
      <FileIcon extension={file.name.split(".").pop() || ""} name={file.name} />
      <span style={{ marginLeft: 1 }}>{file.name}</span>
    </Div>
  );
};

const SubTree = ({
  directory,
  selectedFile,
  onSelect,
}: {
  directory: Directory;
  selectedFile: File | undefined;
  onSelect: (file: File) => void;
}) => {
  return (
    <>
      {directory.dirs.sort(sortDir).map((dir) => (
        <Fragment key={dir.id}>
          <DirDiv
            directory={dir}
            selectedFile={selectedFile}
            onSelect={onSelect}
          />
        </Fragment>
      ))}
      {directory.files.sort(sortFile).map((file) => (
        <Fragment key={file.id}>
          <FileDiv
            file={file}
            selectedFile={selectedFile}
            onClick={() => onSelect(file)}
          />
        </Fragment>
      ))}
    </>
  );
};

const isChildSelected = ({
  directory,
  selectedFile,
}: {
  directory: Directory;
  selectedFile: File;
}) => {
  let res: boolean = false;
  function isChild(dir: Directory, selectedFile: File) {
    if (dir.id === selectedFile.parentId) {
      res = true;
      return;
    }
    if (selectedFile.parentId === "0") {
      res = false;
      return;
    }
    dir.dirs.map((item) => {
      isChild(item, selectedFile);
    });
  }
  isChild(directory, selectedFile);
  return res;
};

const Div = styled.div<{
  depth: number;
  isSelected: boolean;
}>`
  display: flex;
  align-items: center;
  padding-left: ${(props) => props.depth * 16}px;
  background-color: ${(props) =>
    props.isSelected ? "#242424" : "transparent"};

  :hover {
    cursor: pointer;
    background-color: #242424;
  }
`;

const FileIcon = ({
  extension,
  name,
}: {
  name?: string;
  extension?: string;
}) => {
  const icon = getIcon(extension || "", name || "");
  return <Span>{icon}</Span>;
};

const Span = styled.span`
  display: flex;
  width: 32px;
  height: 32px;
  justify-content: center;
  align-items: center;
`;
