import { useGameStore } from '@/store/gameStore';
import { SetupScreen } from '@/components/ui/SetupScreen';
import { GameTable } from '@/components/table/GameTable';
import { Toast } from '@/components/ui/Toast';
import { CardGallery } from '@/components/cards/CardGallery';

const preview = new URLSearchParams(window.location.search).get('preview');

export default function App() {
  const game = useGameStore((s) => s.game);
  const toast = useGameStore((s) => s.toast);
  const newGame = useGameStore((s) => s.newGame);

  if (preview === 'cards') {
    return <CardGallery />;
  }

  return (
    <div className="w-screen h-screen">
      {game ? <GameTable /> : <SetupScreen onStart={newGame} />}
      <Toast toast={toast} />
    </div>
  );
}
