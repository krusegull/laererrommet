export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/veileder/:path*", "/api/chat/:path*"],
};
