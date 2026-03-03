import React, { useState, useCallback } from "react";
import Game3D from "./components/game/Game3D";
import GameOverScreen from "./components/game/GameOverScreen";
import MainMenu from "./components/game/MainMenu";
import VictoryScreen from "./components/game/VictoryScreen";

export type GameState = "menu" | "playing" | "gameover" | "victory";

export interface MatchResult {
  kills: number;
  won: boolean;
}

export default function BattleZoneApp() {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [matchResult, setMatchResult] = useState<MatchResult>({
    kills: 0,
    won: false,
  });

  const handleStartGame = useCallback(() => {
    setGameState("playing");
  }, []);

  const handleGameOver = useCallback((kills: number) => {
    setMatchResult({ kills, won: false });
    setGameState("gameover");
  }, []);

  const handleVictory = useCallback((kills: number) => {
    setMatchResult({ kills, won: true });
    setGameState("victory");
  }, []);

  const handleReturnToMenu = useCallback(() => {
    setGameState("menu");
  }, []);

  const handlePlayAgain = useCallback(() => {
    setGameState("playing");
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden bg-bz-dark font-tactical">
      {gameState === "menu" && (
        <MainMenu onStartGame={handleStartGame} lastMatchResult={matchResult} />
      )}
      {gameState === "playing" && (
        <Game3D onGameOver={handleGameOver} onVictory={handleVictory} />
      )}
      {gameState === "gameover" && (
        <GameOverScreen
          kills={matchResult.kills}
          onPlayAgain={handlePlayAgain}
          onMenu={handleReturnToMenu}
        />
      )}
      {gameState === "victory" && (
        <VictoryScreen
          kills={matchResult.kills}
          onPlayAgain={handlePlayAgain}
          onMenu={handleReturnToMenu}
        />
      )}
    </div>
  );
}
