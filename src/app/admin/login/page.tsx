import { redirect } from "next/navigation";

// Same purpose as "/admin" — redirect a common "admin login" URL guess straight to
// the real login page instead of hitting a 404 first.
export default function AdminLoginRedirect() {
  redirect("/login");
}
