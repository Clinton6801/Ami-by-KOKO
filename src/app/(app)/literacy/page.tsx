/**
 * /literacy redirects to /phonics — same content, new URL matches bottom nav.
 */
import { redirect } from "next/navigation";

export default function LiteracyPage() {
  redirect("/phonics");
}
