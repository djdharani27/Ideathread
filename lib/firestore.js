import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
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

function getNotificationsCollection() {
  ensureDb();
  return collection(db, "notifications");
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
  const ideaRef = doc(getIdeasCollection(), ideaId);
  const ideaSnapshot = await getDoc(ideaRef);

  if (!ideaSnapshot.exists()) {
    throw new Error("This room no longer exists.");
  }

  const idea = { id: ideaSnapshot.id, ...ideaSnapshot.data() };

  await setDoc(messageRef, {
    id: messageRef.id,
    ideaId,
    userId: user.uid,
    userName: user.displayName || "Participant",
    userPhotoURL: user.photoURL || "",
    text,
    createdAt: serverTimestamp(),
  });

  if (idea.userId !== user.uid) {
    const notificationRef = doc(getNotificationsCollection());

    await setDoc(notificationRef, {
      id: notificationRef.id,
      type: "reply",
      ideaId,
      ideaTitle: idea.title || "Idea room",
      messageId: messageRef.id,
      recipientId: idea.userId,
      senderId: user.uid,
      senderName: user.displayName || "Participant",
      senderPhotoURL: user.photoURL || "",
      text,
      read: false,
      createdAt: serverTimestamp(),
    });
  }
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

export function listenToNotificationsForUser(userId, onNext, onError) {
  const notificationsQuery = query(getNotificationsCollection(), where("recipientId", "==", userId));

  return onSnapshot(
    notificationsQuery,
    (snapshot) => {
      const notifications = mapSnapshot(snapshot).sort((left, right) => {
        const leftTime = left.createdAt?.toMillis?.() || 0;
        const rightTime = right.createdAt?.toMillis?.() || 0;
        return rightTime - leftTime;
      });

      onNext(notifications);
    },
    onError,
  );
}

export async function markNotificationAsRead(notificationId) {
  ensureDb();
  await updateDoc(doc(db, "notifications", notificationId), {
    read: true,
  });
}

export async function markNotificationsAsReadForIdea(userId, ideaId) {
  const notificationsQuery = query(getNotificationsCollection(), where("recipientId", "==", userId));

  const snapshot = await getDocs(notificationsQuery);

  await Promise.all(
    snapshot.docs
      .filter((notificationDoc) => {
        const notification = notificationDoc.data();
        return notification.ideaId === ideaId && notification.read === false;
      })
      .map((notificationDoc) =>
        updateDoc(notificationDoc.ref, {
          read: true,
        }),
      ),
  );
}
