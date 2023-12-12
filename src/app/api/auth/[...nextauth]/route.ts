import { authenticateUser } from "@/actions";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const user = await authenticateUser(
          credentials.email,
          credentials.password
        );
        if (user) {
          return user;
        } else {
          throw new Error("CredentialsSignin");
        }
      },
    }),
  ],
  secret: process.env.JWT_SECRET,
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
