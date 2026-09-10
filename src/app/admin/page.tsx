import { redirect } from "next/navigation";

// "/admin" isn't a real section of the app — the admin panel lives at "/dashboard"
// (which itself sends unauthenticated visitors to "/login"). This route exists purely
// so a bookmarked/typed "/admin" URL redirects instantly instead of hitting a 404 first.
export default function AdminRedirect() {
  redirect("/dashboard");
}
