import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { functions } from "@/inngest/functions";

const handler = serve({
  client: inngest,
  functions,
});

export { handler as GET, handler as POST };
