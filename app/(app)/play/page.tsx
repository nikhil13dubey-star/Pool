import { GamesClient } from "@/components/games/games-client";

// Global games entry (from the Play tab). Teams are entered manually here;
// launching from a group seeds team names from trip members instead.
export default function PlayPage() {
  return <GamesClient memberNames={[]} />;
}
