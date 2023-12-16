import { authenticateUser } from "@/actions";
import { User } from "@/types";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials) {
          return null;
        }
        const user = await authenticateUser(
          credentials.email,
          credentials.password
        ) as User | null;

        if (user) {
          return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
        } else {
          return null;
        }
      },
    }),
  ],
  secret: process.env.JWT_SECRET,
});

export { handler as GET, handler as POST };