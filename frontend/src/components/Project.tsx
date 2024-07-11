import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { EXECUTION_ENGINE_URI } from "../config";
import { useSearchParams } from "react-router-dom";
import { File, RemoteFile, Type } from "./external/editor/utils/file-manager";
import { Editor } from "./Editor";
import { Output } from "./Output";
import { TerminalComponent } from "./Terminal";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end; /* Aligns children (button) to the right */
  padding: 10px; /* Adds some space around the button */
`;

const Workspace = styled.div`
  display: flex;
  margin: 0;
  font-size: 16px;
  width: 100%;
`;

const LeftPanel = styled.div`
  flex: 1;
  width: 60%;
`;

const RightPanel = styled.div`
  flex: 1;
  width: 40%;
`;

function useSocket(replId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(`${EXECUTION_ENGINE_URI}?replId=${replId}`);

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [replId]);

  return socket;
}

const Project = () => {
  const [searchParams] = useSearchParams();
  const replId = searchParams.get("replId") || "";
  const socket = useSocket(replId) as Socket;
  const [loaded, setLoaded] = useState(false);
  const [fileStructure, setFileStructure] = useState<RemoteFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    socket?.on("loaded", ({ rootContent }: { rootContent: RemoteFile[] }) => {
      setLoaded(true);
      setFileStructure(rootContent);
    });
  }, [socket]);

  const onSelect = (file: File) => {
    if (file.type === Type.DIRECTORY) {
      socket?.emit("fetchDir", file.path, (content: RemoteFile[]) => {
        setFileStructure((prev) => {
          const updatedFiles = [...prev, ...content];
          return updatedFiles.filter(
            (file, index, self) =>
              self.findIndex((f) => f.path === file.path) === index
          );
        });
      });
    } else {
      socket?.emit("fetchFileContent", file.path, (content: string) => {
        file.content = content;
        setSelectedFile(file);
      });
    }
  };

  if (!loaded) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <ButtonContainer>
        <button onClick={() => setShowOutput(!showOutput)}>Show Output</button>
      </ButtonContainer>
      <Workspace>
        <LeftPanel>
          <Editor
            files={fileStructure}
            onSelect={onSelect}
            selectedFile={selectedFile}
            socket={socket}
          />
        </LeftPanel>
        <RightPanel>
          {showOutput && <Output />}
          <TerminalComponent socket={socket} />
        </RightPanel>
      </Workspace>
    </Container>
  );
};

export default Project;
