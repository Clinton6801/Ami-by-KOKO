/**
 * Checks if a song MP3 file exists by making a HEAD request.
 * Used to determine if SongButton should show "Coming soon" state.
 */

export async function checkSongExists(audioPath: string): Promise<boolean> {
  try {
    const response = await fetch(audioPath, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}
