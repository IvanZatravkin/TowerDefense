import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Engine } from "./engine";
import "normalize.css";
import "./global.css";
import { store } from "./state";
import { UI } from "./ui";

const root = document.createElement("div");
document.body.appendChild(root);
window.TILE_SIZE = 256;
import { resourcesPromise } from "./resources";
import { Box } from "./ui/ui-kit/components/layout/box/v1";

const App = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    resourcesPromise.then(() => setLoaded(true));
  });

  React.useLayoutEffect(() => {
    if (canvasRef.current && loaded) {
      const engine = new Engine(canvasRef.current, store);
      engine.start();
    }
  }, [loaded]);

  return (
    <>
      <UI>
        <Box flexGrow={1}>
          <canvas
            ref={canvasRef}
            style={{ position: "absolute", top: 0, left: 0 }}
          />
        </Box>
      </UI>
    </>
  );
};

createRoot(root).render(<App />);
export { pickRandomArrayElement } from "./utils/pickRandomArrayElement";
