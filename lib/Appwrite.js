import {
  Client,
  Account,
  ID,
  Avatars,
  Databases,
  Storage,
  Query,
  Teams,
} from "react-native-appwrite";

const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID)
  .setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PLATFORM);

const account = new Account(client);
const databases = new Databases(client);
const teams = new Teams(client);
const storage = new Storage(client);
const avatars = new Avatars(client);

export const ROLES = {
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
};

export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    canCreateList: true,
    canEditList: true,
    canDeleteList: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canExportData: true,
  },
  [ROLES.EDITOR]: {
    canCreateList: true,
    canEditList: true,
    canDeleteList: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canExportData: true,
  },
  [ROLES.VIEWER]: {
    canCreateList: false,
    canEditList: false,
    canDeleteList: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canExportData: false,
  },
};

// Register a new user
export async function registerUser(
  email,
  password,
  username,
  role = ROLES.ADMIN
) {
  try {
    // Create a new user account
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw new Error("Failed to create account");
    // Optionally, sign in the user immediately after registration
    await signIn(email, password);

    // Create a team for the user's own account
    const userTeam = await teams.create(
      `user-${newAccount.$id}`,
      `${username}'s Team`
    );

    // Add the user to their own team with the specified role
    await teams.createMembership(
      userTeam.$id,
      newAccount.$id,
      [role],
      process.env.EXPO_PUBLIC_VERIFICATION_URL || "http://localhost/verify"
    );

    // Create a user document in the database
    const newUser = await databases.createDocument(
      process.env.EXPO_PUBLIC_DATABASE_ID,
      process.env.EXPO_PUBLIC_USER_COLLECTION_ID,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        role: role,
      }
    );

    return newUser;
  } catch (error) {
    throw new Error(error.message || "An error occurred during registration");
  }
}

// Sign in user
export async function signIn(email, password) {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    throw new Error(error.message);
  }
}
// Get Account
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    throw new Error(error);
  }
}

// Get Current User
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      process.env.EXPO_PUBLIC_DATABASE_ID,
      process.env.EXPO_PUBLIC_USER_COLLECTION_ID,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Logout
export async function signOut() {
  try {
    await account.deleteSession("current");
    return { success: true };
  } catch (error) {
    console.error("Logout failed:", error);
    return { success: false, error: error.message };
  }
}
