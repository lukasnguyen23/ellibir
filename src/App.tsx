import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useLobbyStore } from '@/store/lobbyStore';
import { SetupScreen } from '@/components/ui/SetupScreen';
import { HomeScreen } from '@/components/ui/HomeScreen';
import { LobbyScreen } from '@/components/ui/LobbyScreen';
import { GameTable } from '@/components/table/GameTable';
import { Toast } from '@/components/ui/Toast';
import { CardGallery } from '@/components/cards/CardGallery';

const preview = new URLSearchParams(window.location.search).get('preview');

export default function App() {
  const game = useGameStore((s) => s.game);
  const toast = useGameStore((s) => s.toast);
  const newGame = useGameStore((s) => s.newGame);
  const screen = useLobbyStore((s) => s.screen);
  const initPlayer = useLobbyStore((s) => s.initPlayer);
  const joinOnlineRoom = useLobbyStore((s) => s.joinOnlineRoom);
  const setJoinCodeInput = useLobbyStore((s) => s.setJoinCodeInput);

  useEffect(() => {
    initPlayer();
  }, [initPlayer]);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('room');
    if (!code) return;
    void (async () => {
      try {
        initPlayer();
        setJoinCodeInput(code);
        await joinOnlineRoom(code);
      } catch {
        /* Fehler landet im lobbyStore.error */
      }
    })();
  }, [initPlayer, joinOnlineRoom, setJoinCodeInput]);

  if (preview === 'cards') {
    return <CardGallery />;
  }

  return (
    <div className="w-screen h-dvh">
      {game ? (
        <GameTable />
      ) : screen === 'lobby' ? (
        <LobbyScreen />
      ) : screen === 'hotseat' ? (
        <SetupScreen onStart={newGame} onBack={() => useLobbyStore.getState().setScreen('home')} />
      ) : (
        <HomeScreen />
      )}
      <Toast toast={toast} />
    </div>
  );
}
