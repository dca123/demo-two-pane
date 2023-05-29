import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const funds = createTRPCRouter({
  list: publicProcedure.query(({ input }) => {
    const data = Array.from(
      {
        length: 5,
      },
      (_, i) => ({
        id: i,
        name: `Fund ${i}`,
      })
    );
    return data;
  }),
});
