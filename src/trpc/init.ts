import { initTRPC, TRPCError } from "@trpc/server";
import { auth, isAdminEmail } from "@/lib/auth";

// ---- Context ----

/**
 * Create tRPC context from request headers.
 *
 * Accepts only `{ headers }` (not the full Request) so the creator can be
 * reused across the API route handler, the RSC server proxy, and tests.
 */
export async function createContext(opts: { headers: Headers }) {
  const session = await auth.api.getSession({ headers: opts.headers });
  const userId = session?.user?.id;
  const userEmail = session?.user?.email;
  const isAdmin = userEmail ? isAdminEmail(userEmail) : false;
  return { session, userId, userEmail, isAdmin };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

// ---- tRPC initialization ----

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

// ---- Middleware ----

/** Requires authenticated user session */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      userId: ctx.userId,
    },
  });
});

/** Requires admin role on top of authentication */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.isAdmin) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({
    ctx: {
      ...ctx,
      isAdmin: true,
    },
  });
});
