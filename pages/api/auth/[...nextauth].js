import NextAuth from "next-auth"
import TwitterProvider from "next-auth/providers/twitter";
import Dis from "next-auth/providers/twitter";
import DiscordProvider from "next-auth/providers/discord";
export default NextAuth({
    providers: [
      DiscordProvider({
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        scope: 'identify',

      })
    ],
    callbacks: {
      jwt({ token, account, user }) {
        console.log(user)
        if (account) {
          token.accessToken = account.access_token
          token.id = user?.id
        }
        return token
      },
      session({ session, token }) {
        // I skipped the line below coz it gave me a TypeError
        // session.accessToken = token.accessToken;
        session.user.email = token.id;
  
        return session;
      },
    },
    // pages: {
    //   signIn: "/signIn",
    // },
  });
  