import { auth, isAdminEmail } from "@/lib/auth";

export async function createContext(opts: { req: Request }) {
  const session = await auth.api.getSession({ headers: opts.req.headers });

  const userId = session?.user?.id;
  const userEmail = session?.user?.email;
  const isAdmin = userEmail ? isAdminEmail(userEmail) : false;

  return {
    session,
    userId,
    userEmail,
    isAdmin,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
