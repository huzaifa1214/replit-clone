import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
const fitAddon = new FitAddon();

const OPTIONS_TERM = {
  useStyle: true,
  screenKeys: true,
  cursorBlink: true,
  cols: 200,
  theme: {
    background: "black",
  },
};

function ab2str(buf: ArrayBuffer) {
  const unit8Array = new Uint8Array(buf);
  const charCodes = Array.from(unit8Array);
  return String.fromCharCode.apply(null, charCodes);
}

export const TerminalComponent = ({ socket }: { socket: Socket }) => {
  const terminalRef = useRef(null);

  useEffect(() => {
    if (!terminalRef || !terminalRef.current || !socket) {
      return;
    }
    socket.emit("requestTerminal");
    socket.on("terminal", terminalHandler);
    const terminal = new Terminal(OPTIONS_TERM);
    terminal.loadAddon(fitAddon);
    terminal.open(terminalRef.current);
    fitAddon.fit();

    function terminalHandler({ data }: { data: ArrayBuffer | string }) {
      if (data instanceof ArrayBuffer) {
        console.error(data);
        console.log(ab2str(data));
        terminal.write(ab2str(data));
      }
    }

    terminal.onData((data) => {
      socket.emit("terminalData", data);
    });

    socket.emit("terminalData", "\n");

    return () => {
      socket.off("terminal");
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminalRef]);

  return (
    <div
      style={{ width: "40vw", height: "400px", textAlign: "left" }}
      ref={terminalRef}
    ></div>
  );
};
