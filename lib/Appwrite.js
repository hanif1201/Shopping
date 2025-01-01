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

export async function createList(name, description = "") {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");

    console.log("Creating list with user:", currentUser); // Debug user data

    const list = await databases.createDocument(
      process.env.EXPO_PUBLIC_DATABASE_ID,
      process.env.EXPO_PUBLIC_LISTS_COLLECTION_ID,
      ID.unique(),
      {
        name,
        description,
        userId: currentUser.$id, // Check if this should be currentUser.accountId instead
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    console.log("Created list:", list); // Debug created list
    return list;
  } catch (error) {
    console.error("Create list error:", error);
    throw new Error(error.message || "Failed to create list");
  }
}

export async function getLists() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");

    console.log("Getting lists for user:", currentUser); // Debug user data

    const lists = await databases.listDocuments(
      process.env.EXPO_PUBLIC_DATABASE_ID,
      process.env.EXPO_PUBLIC_LISTS_COLLECTION_ID,
      [Query.equal("userId", currentUser.$id)] // Check if this should match the field used in createList
    );

    console.log("Raw lists response:", lists); // Debug full response
    return lists.documents;
  } catch (error) {
    console.error("Error fetching lists:", error);
    return [];
  }
}

export async function getList(listId) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");

    const list = await databases.getDocument(
      process.env.EXPO_PUBLIC_DATABASE_ID,
      process.env.EXPO_PUBLIC_LISTS_COLLECTION_ID,
      listId
    );

    return list;
  } catch (error) {
    console.error("Error fetching list:", error);
    throw new Error(error.message || "Failed to fetch list");
  }
}

export async function updateList(listId, updates) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");

    const updatedList = await databases.updateDocument(
      process.env.EXPO_PUBLIC_DATABASE_ID,
      process.env.EXPO_PUBLIC_LISTS_COLLECTION_ID,
      listId,
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    );

    return updatedList;
  } catch (error) {
    console.error("Update list error:", error);
    throw new Error(error.message || "Failed to update list");
  }
}

export async function deleteList(listId) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");

    await databases.deleteDocument(
      process.env.EXPO_PUBLIC_DATABASE_ID,
      process.env.EXPO_PUBLIC_LISTS_COLLECTION_ID,
      listId
    );

    return { success: true };
  } catch (error) {
    console.error("Delete list error:", error);
    throw new Error(error.message || "Failed to delete list");
  }
}

// Products Collection Operations
export async function addProduct(listId, name, quantity = 1) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");

    const product = await databases.createDocument(
      process.env.EXPO_PUBLIC_DATABASE_ID,
      process.env.EXPO_PUBLIC_PRODUCTS_COLLECTION_ID,
      ID.unique(),
      {
        listId,
        name,
        quantity,
        bought: false,
        userId: currentUser.$id,
        // createdAt: new Date().toISOString(),
        // updatedAt: new Date().toISOString(),
      }
    );

    return product;
  } catch (error) {
    throw new Error(error.message || "Failed to add product");
  }
}

export async function getProducts(listId) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");

    const products = await databases.listDocuments(
      process.env.EXPO_PUBLIC_DATABASE_ID,
      process.env.EXPO_PUBLIC_PRODUCTS_COLLECTION_ID,
      [Query.equal("listId", listId), Query.equal("userId", currentUser.$id)]
    );

    return products.documents;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch products");
  }
}

export async function toggleProductBought(productId, bought) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");

    const product = await databases.updateDocument(
      process.env.EXPO_PUBLIC_DATABASE_ID,
      process.env.EXPO_PUBLIC_PRODUCTS_COLLECTION_ID,
      productId,
      {
        bought,
      }
    );

    return product;
  } catch (error) {
    throw new Error(error.message || "Failed to update product status");
  }
}

export async function updateProductQuantity(productId, quantity) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");

    const product = await databases.updateDocument(
      process.env.EXPO_PUBLIC_DATABASE_ID,
      process.env.EXPO_PUBLIC_PRODUCTS_COLLECTION_ID,
      productId,
      {
        quantity,
        updatedAt: new Date().toISOString(),
      }
    );

    return product;
  } catch (error) {
    throw new Error(error.message || "Failed to update product quantity");
  }
}

export async function deleteProduct(productId) {
  try {
    await databases.deleteDocument(
      process.env.EXPO_PUBLIC_DATABASE_ID,
      process.env.EXPO_PUBLIC_PRODUCTS_COLLECTION_ID,
      productId
    );

    return { success: true };
  } catch (error) {
    throw new Error(error.message || "Failed to delete product");
  }
}

export async function updateProduct(productId, updates) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");

    const product = await databases.updateDocument(
      process.env.EXPO_PUBLIC_DATABASE_ID,
      process.env.EXPO_PUBLIC_PRODUCTS_COLLECTION_ID,
      productId,
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    );

    return product;
  } catch (error) {
    console.error("Update product error:", error);
    throw new Error(error.message || "Failed to update product");
  }
}
