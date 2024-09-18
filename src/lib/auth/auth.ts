import { DefaultSession, SvelteKitAuth, SvelteKitAuthConfig } from '@auth/sveltekit';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from '@auth/sveltekit/providers/google';
import { db } from '$lib/db/db';
import { AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET } from '$env/static/private';

const authOptions: SvelteKitAuthConfig = {
	adapter: PrismaAdapter(db),
	providers: [
		Google({
			clientId: AUTH_GOOGLE_ID,
			clientSecret: AUTH_GOOGLE_SECRET,

			authorization: {
				params: {
					prompt: 'consent',
					access_type: 'offline',
					response_type: 'code'
				}
			}
		})
	],
	trustHost: true,
	callbacks: {
		async signIn({ user, account }) {
			const email = user.email;
	  
			// Check if the user already exists in the database
			let existingUser = await db.user.findUnique({
			  where: { email: email as string },
			});
	  
			if (!existingUser) {
			  // If the user doesn't exist, create a new user
			  existingUser = await db.user.create({
				data: {
				  email: email as string,
				  name: user.name,
				  image: user.image,
				  bio: `Hello! I am ${user.name}.`,
				  accounts: {
					create: {
					  provider: account?.provider as string,
					  providerAccountId: account?.providerAccountId as string,
					  type: account?.type as string,  // Ensure this matches your schema
					  access_token: account?.access_token || undefined,
					  refresh_token: account?.refresh_token || undefined,
					  expires_at: account?.expires_at || undefined,
					  token_type: account?.token_type || undefined,
					  scope: account?.scope || undefined,
					  id_token: account?.id_token || undefined,
					},
				  },
				},
			  });
			} else {
			  // If the user exists, update their name, image, and account information
			  existingUser = await db.user.update({
				where: { email: email as string },
				data: {
				  name: user.name || existingUser.name,
				  image: user.image || existingUser.image,
				  bio: existingUser.bio || `Hello! I am ${user.name}.`,
				  accounts: {
					upsert: {
					  where: {
						provider_providerAccountId: {
						  provider: account?.provider as string,
						  providerAccountId: account?.providerAccountId as string,
						},
					  },
					  update: {
						access_token: account?.access_token || undefined,
						refresh_token: account?.refresh_token || undefined,
						expires_at: account?.expires_at || undefined,
					  },
					  create: {
						provider: account?.provider as string,
						providerAccountId: account?.providerAccountId as string,
						type: account?.type as string,  // Ensure this matches your schema
						access_token: account?.access_token || undefined,
						refresh_token: account?.refresh_token || undefined,
						expires_at: account?.expires_at || undefined,
						token_type: account?.token_type || undefined,
						scope: account?.scope || undefined,
						id_token: account?.id_token || undefined,
					  },
					},
				  },
				},
			  });
			}
	  
			return true; // Continue with the sign-in
		  },
		async session({ session, user }) {
			const sess = {} as DefaultSession;

			sess.expires = session.expires;
			sess.user = user

			return sess;
		}
	}
};

export const { handle, signIn, signOut } = SvelteKitAuth(authOptions);
