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

    // Create user document BEFORE signing in
    const newUser = await databases.createDocument(
      process.env.EXPO_PUBLIC_DATABASE_ID,
      process.env.EXPO_PUBLIC_USER_COLLECTION_ID,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        role: role,
        // createdAt: new Date().toISOString(), // Add creation timestamp
        // updatedAt: new Date().toISOString(), // Add update timestamp
      }
    );

    // Sign in the user after both account and user document are created
    await signIn(email, password);

    // Create a team for the user's own account
    const userTeam = await teams.create(
      `user-${newAccount.$id}`,
      `${username}'s Team`
    );

    return newUser;
  } catch (error) {
    // Add cleanup in case of partial completion
    console.error("Registration error:", error);
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
    if (!currentAccount) {
      console.log("No current account found");
      return null;
    }

    const currentUser = await databases.listDocuments(
      process.env.EXPO_PUBLIC_DATABASE_ID,
      process.env.EXPO_PUBLIC_USER_COLLECTION_ID,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser || currentUser.documents.length === 0) {
      console.log("No user document found for account:", currentAccount.$id);
      return null;
    }

    return currentUser.documents[0];
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

// Safe way to get user data with proper error handling
export async function getUserData() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("User not found or not authenticated");
    }
    return user;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
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

// Create a new list

export async function createList(name, description = "") {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");

    const list = await databases.createDocument(
      process.env.EXPO_PUBLIC_DATABASE_ID,
      process.env.EXPO_PUBLIC_LISTS_COLLECTION_ID,
      ID.unique(),
      {
        name,
        description,
        userId: currentUser.$id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    return list;
  } catch (error) {
    throw new Error(error.message || "Failed to create list");
  }
}

// Get all lists
export async function getLists() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");

    const lists = await databases.listDocuments(
      process.env.EXPO_PUBLIC_DATABASE_ID,
      process.env.EXPO_PUBLIC_LISTS_COLLECTION_ID,
      [Query.equal("userId", currentUser.$id)]
    );

    return lists.documents;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch lists");
  }
}
