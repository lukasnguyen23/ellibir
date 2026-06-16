import { useGameStore } from '@/store/gameStore';
import { SetupScreen } from '@/components/ui/SetupScreen';
import { GameTable } from '@/components/table/GameTable';
import { Toast } from '@/components/ui/Toast';

export default function App() {
  const game = useGameStore((s) => s.game);
  const toast = useGameStore((s) => s.toast);
  const newGame = useGameStore((s) => s.newGame);

  return (
    <div className="w-screen h-screen">
      {game ? <GameTable /> : <SetupScreen onStart={newGame} />}
      <Toast toast={toast} />
    </div>
  );
}
