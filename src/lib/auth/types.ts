type User = {
	id: string;
	name: string;
	email: string;
	emailVerified: any;
	image: string;

	displayName: string | null;
	bio: string | null;
	phone: string | null;
	username: string | null;
	college: string | null;
	usn: string | null;

	lightTheme: string | null;
	darkTheme: string | null;

	createdAt: string;
	updatedAt: string;
};

type UserData = {
	id: string;
	displayName: string;
	username: string;
	usn: string | null;
};

type UserProfileData = {
	id: string;
	displayName: string | null;
	photoURL: string|null;
	bio: string | null;
	phone: string | null;
	email: string | null;
	usn: string | null;
	username: string | null;
	college: string | null;
	lightTheme: string | null;
	darkTheme: string | null;
	instagram: string | null;
	linkedin: string | null;
	github: string | null;
	twitter: string | null;
	custom: {[key: string]: string} | null;
	order: string[];
	[key: string]: any
};

export { 
    type User, 
    type UserData, 
    type UserProfileData
};
