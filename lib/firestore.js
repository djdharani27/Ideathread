import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

function ensureDb() {
  if (!db) {
    throw new Error("Firebase environment variables are missing.");
  }
}

function getUsersCollection() {
  ensureDb();
  return collection(db, "users");
}

function getIdeasCollection() {
  ensureDb();
  return collection(db, "ideas");
}

function getMessagesCollection() {
  ensureDb();
  return collection(db, "messages");
}

function mapSnapshot(snapshot) {
  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

export async function saveUserProfile(user) {
  const userRef = doc(getUsersCollection(), user.uid);
  const existingUser = await getDoc(userRef);

  if (!existingUser.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName || "Participant",
      email: user.email || "",
      photoURL: user.photoURL || "",
      createdAt: serverTimestamp(),
    });
    return;
  }

  await setDoc(
    userRef,
    {
      uid: user.uid,
      name: user.displayName || "Participant",
      email: user.email || "",
      photoURL: user.photoURL || "",
    },
    { merge: true },
  );
}

export async function createIdea(user, values) {
  const ideaRef = doc(getIdeasCollection());

  await setDoc(ideaRef, {
    id: ideaRef.id,
    userId: user.uid,
    authorName: user.displayName || "Participant",
    authorEmail: user.email || "",
    authorPhotoURL: user.photoURL || "",
    title: values.title,
    description: values.description,
    createdAt: serverTimestamp(),
  });
}

export async function createMessage(user, ideaId, text) {
  const messageRef = doc(getMessagesCollection());

  await setDoc(messageRef, {
    id: messageRef.id,
    ideaId,
    userId: user.uid,
    userName: user.displayName || "Participant",
    userPhotoURL: user.photoURL || "",
    text,
    createdAt: serverTimestamp(),
  });
}

export function listenToIdeas(onNext, onError) {
  const ideasQuery = query(getIdeasCollection(), orderBy("createdAt", "desc"));
  return onSnapshot(ideasQuery, (snapshot) => onNext(mapSnapshot(snapshot)), onError);
}

export function listenToIdea(ideaId, onNext, onError) {
  ensureDb();
  const ideaRef = doc(db, "ideas", ideaId);

  return onSnapshot(
    ideaRef,
    (snapshot) => {
      onNext(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
    },
    onError,
  );
}

export function listenToMessages(onNext, onError) {
  const messagesQuery = query(getMessagesCollection(), orderBy("createdAt", "desc"));
  return onSnapshot(messagesQuery, (snapshot) => onNext(mapSnapshot(snapshot)), onError);
}

export function listenToMessagesForIdea(ideaId, onNext, onError) {
  const messagesQuery = query(
    getMessagesCollection(),
    where("ideaId", "==", ideaId),
    orderBy("createdAt", "asc"),
  );

  return onSnapshot(messagesQuery, (snapshot) => onNext(mapSnapshot(snapshot)), onError);
}
