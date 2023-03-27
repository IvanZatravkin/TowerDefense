import React, { PropsWithChildren, useCallback } from "react";
import { observer } from "mobx-react-lite";
import styled from "@emotion/styled";
import { store } from "../state";
import { Provider } from "./ui-kit/provider";
import { Box } from "./ui-kit/components/layout/box/v1";
import { If } from "./ui-kit/components/conditionals/If";
import { Button } from "./ui-kit/components/elements/button/v1";
import { T } from "./ui-kit/components/elements/text/v1";

const DefenseTopBar = observer(() => {
  const defenseInstance = store.defenseInstance!;
  return (
    <Box>
      Gold: {defenseInstance.gold}; Score: {defenseInstance.score}; Wave: {defenseInstance.currentWave}
    </Box>
  );
});

const GlobalMapTopBar = observer(() => {
  const controlledTiles = [...store.worldMap.grid.hexagons.entries()].filter(
    ([, hexagon]) => hexagon.controlledBy === 1
  );
  return <Box>{controlledTiles.length} tiles</Box>;
});

const TopBar = observer(() => {
  return (
    <Box height="50px" bg="main">
      <If condition={!!store.defenseInstance}>
        <DefenseTopBar />
      </If>
      <If condition={!store.defenseInstance}>
        <GlobalMapTopBar />
      </If>
    </Box>
  );
});

const ProgressBar = styled(Box)(({ progress }: { progress: number }) => ({
  transform: `scale(1, ${progress})`,
  transformOrigin: "bottom",
  transition: "none",
}));

const SpellIcon = React.memo(
  ({
    name,
    onClick,
    active,
    cooldown = 1,
    remaining = 0,
  }: {
    name: string;
    onClick?: () => void;
    active?: boolean;
    cooldown?: number;
    remaining?: number;
  }) => {
    return (
      <Box
        border={1}
        borderRadius={20}
        flexDirection="column"
        height={100}
        width={100}
        bg="main"
        borderColor={active ? "active" : "main"}
        justifyContent="center"
        alignItems="center"
        cursor="pointer"
        onClick={onClick}
        overflow="hidden"
      >
        <ProgressBar
          position="absolute"
          bottom="0"
          left="0"
          bg="success"
          progress={1 - remaining / cooldown}
          width="100%"
          zIndex={1}
          height="100%"
        />
        <Box zIndex={2}>{name}</Box>
      </Box>
    );
  }
);

const SpellSelector = observer(() => {
  const defenseInstance = store.defenseInstance!;
  const base = defenseInstance.landscape.bases[0];
  return (
    <Box flexDirection="row" gap={20} justifyContent="center" alignItems="center" width="100%">
      <SpellIcon
        name="Fireball"
        active={defenseInstance.active_spell == "fireball"}
        onClick={() => defenseInstance.setActiveSpell("fireball")}
        remaining={defenseInstance.magicProvider.remainingCooldowns.fireball}
        cooldown={defenseInstance.magicProvider.cooldowns.fireball}
      />
      <SpellIcon
        name="Tower"
        active={defenseInstance.active_spell == "tower"}
        onClick={() => defenseInstance.setActiveSpell("tower")}
        remaining={0}
      />
      <SpellIcon
        name="Force Field"
        active={defenseInstance.active_spell == "force_field"}
        onClick={() => defenseInstance.castForceField(base.pos)}
        remaining={defenseInstance.magicProvider.remainingCooldowns.forcefield}
        cooldown={defenseInstance.magicProvider.cooldowns.forcefield}
      />
    </Box>
  );
});

const FullScreenButton = React.memo(() => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);
  return <Button onClick={toggleFullscreen}>{isFullscreen ? "Exit fullscreen" : "Fullscreen"}</Button>;
});

const SpellBar = observer(() => {
  return (
    <Box height={120} minHeight={120}>
      <If condition={!!store.defenseInstance}>
        <SpellSelector />
      </If>
    </Box>
  );
});

const GameMenu = observer(() => {
  if (store.defenseInstance) return null;
  return (
    <Box
      position="absolute"
      top="0"
      left="0"
      width="100vw"
      height="100vh"
      bg="dark"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
    >
      <Box bg="main" p={20} borderRadius={20} flexDirection="column">
        <Button
          onClick={() => {
            store.startInstance();
          }}
          type="success"
        >
          Play
        </Button>
        <Box mT={4}>
          <Button
            onClick={() => {
              store.startInstance(8, 8);
            }}
            type="success"
          >
            Medium map size
          </Button>
        </Box>
        <Box mT={4}>
          <Button
            onClick={() => {
              store.startInstance(5, 5);
            }}
            type="success"
          >
            Small map size
          </Button>
        </Box>
        <Box mT={4}>
          <FullScreenButton />
        </Box>
        <If condition={!!store.scores.length}>
          <Box mT={4} flexDirection="column">
            <T>High scores:</T>
            {store.scores.map((score, i) => (
              <T key={`${i}-${score}`}>
                {i + 1}. {score}
              </T>
            ))}
          </Box>
        </If>
      </Box>
    </Box>
  );
});

export const UI = React.memo(({ children }: PropsWithChildren) => {
  return (
    <Provider>
      <Box minHeight="100vh" maxHeight="100vh" minWidth="100vw" flexDirection="column" bg="dark">
        <TopBar />
        {children}
        <SpellBar />
        <GameMenu />
      </Box>
    </Provider>
  );
});
