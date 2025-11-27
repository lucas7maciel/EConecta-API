
console.log("🔥 PROXY ATIVADO");

export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/api/trashspots", "/api/trashspots/:path*"],
};
