import {
  Armchair, Bank, BookOpen, Brain, Briefcase, Car, Confetti, DeviceMobile, FilmSlate, GameController,
  GlobeHemisphereWest, GraduationCap, Guitar, Hamburger, Leaf, Lightning, MagicWand, MapPin,
  MusicNotes, PawPrint, PuzzlePiece, ShoppingBag, SoccerBall, SquaresFour, TShirt, Television,
  Trophy, VideoCamera, type Icon,
} from '@phosphor-icons/react';

const ICONS: Record<string, Icon> = {
  all: SquaresFour,
  food: Hamburger,
  animals: PawPrint,
  games: GameController,
  brainrot: Brain,
  creators: VideoCamera,
  apps: DeviceMobile,
  movies: FilmSlate,
  shows: Television,
  music: MusicNotes,
  instruments: Guitar,
  sports: SoccerBall,
  athletes: Trophy,
  superheroes: Lightning,
  places: MapPin,
  countries: GlobeHemisphereWest,
  landmarks: Bank,
  jobs: Briefcase,
  home: Armchair,
  school: GraduationCap,
  vehicles: Car,
  brands: ShoppingBag,
  clothing: TShirt,
  nature: Leaf,
  holidays: Confetti,
  fantasy: MagicWand,
  board: PuzzlePiece,
  din: BookOpen,
};

export function TopicIcon({ id, size = 26 }: { id: string; size?: number }) {
  const Glyph = ICONS[id] ?? SquaresFour;
  return <Glyph className="topic__icon" size={size} weight="duotone" aria-hidden />;
}
