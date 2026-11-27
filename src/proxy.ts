import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return token?.role === "ADMIN";
        }
        return Boolean(token);
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Beskytt alle ruter unntatt:
     * - / (offentlig forside)
     * - /login, /register (auth-sider)
     * - /api/auth/*, /api/register (auth-endepunkter)
     * - /delta, /api/live/bli-med, /api/live/spiller (elevene i live-spill – ingen konto)
     * - Next.js interne ruter og statiske filer
     */
    "/((?!$|login|register|api/auth|api/register|delta|api/live/bli-med|api/live/spiller|_next/static|_next/image|favicon.ico).*)",
  ],
};
