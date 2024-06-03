import { auth, db, storage } from "./firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { serverTimestamp, setDoc, doc, addDoc, collection, getDocs, updateDoc, arrayUnion } from "firebase/firestore";
import { uuid } from 'uuidv4';

// her må denne logikken bli fikset
//const userID = auth.currentUser.uid
const userID = "7Xb3FhzT1UUdP5BeB84GNwQfnQo1"
export const createGroup = async (title, description, image) => {
    const groupsCollectionRef = collection(db, "groups")
    try {
        let imageUrl = ""
        if (image != null) {
            const imageRef = ref(storage, `groups/${title}/banner/${uuid()}`);
            await uploadBytes(imageRef, image);
            imageUrl = await getDownloadURL(imageRef);
        }
        const res = await addDoc(groupsCollectionRef, {
            title: title,
            description: description,
            createdAt: serverTimestamp(),
            creator: "userID",
            imgUrl: imageUrl,
            memberInfo: [{}]
        });
        return { res: res, status: "ok" }
    } catch (error) {
        console.log(error)
        return error
    }
}

export const addMember = async (groupId, user) => {
    const memberDocRef = doc(db, "groups", groupId)
    const fullName = user.firstName + " " + user.lastName
    //må ha en egen date for onServerTimestamp da dette er ikkje er supportert i firebase arrays


    const memberData = {
        uid: user.uid,
        fullName: fullName,
        added: ""
    }
    try {
        const res = await updateDoc(memberDocRef, {
            memberInfo: arrayUnion(memberData)
        }
        )
        return { res: res, status: "ok" }
    } catch (error) {
        return error
    }
}

export const addPost = async (groupId, content, image) => {
    const postsCollectionRef = collection(db, "groups", groupId, "posts")
    try {
        let imageUrl = ""
        if (image != null) {
            const imageRef = ref(storage, `groups/${groupId}/posts/${userID}/${uuid()}`);
            await uploadBytes(imageRef, image);
            imageUrl = await getDownloadURL(imageRef);
        }
        const res = await addDoc(postsCollectionRef, {
            name: userID,
            content: content,
            imgUrl: imageUrl,
            posted: serverTimestamp()
        })
        return { res: res, status: "ok" }
    } catch (error) {
        return error
    }
}