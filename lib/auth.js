import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth, isFirebaseConfigured } from "./firebase";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export async function signInWithGoogle() {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase is not configured. Add the NEXT_PUBLIC_FIREBASE_* values to .env.local and restart the app.",
    );
  }

  if (!auth) {
    throw new Error("Authentication is only available in the browser.");
  }

  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutUser() {
  if (!auth) {
    return;
  }

  await signOut(auth);
}
