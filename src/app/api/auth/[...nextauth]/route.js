import { handlers } from "@auth/nextjs";
import { authOptions } from "../../../../lib/auth";

export const { GET, POST } = handlers(authOptions);
