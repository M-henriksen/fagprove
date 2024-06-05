import { auth, db, storage } from "./firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { serverTimestamp, setDoc, doc, addDoc, collection, getDocs, updateDoc, arrayUnion, query, getDoc } from "firebase/firestore";
import { uuid } from 'uuidv4';

import dayjs from "dayjs"


const getUserData = async () => {
    const userID = auth.currentUser.uid;
    const userDocRef = doc(db, "users", userID);
    const userSnapshot = await getDoc(userDocRef);
    if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        return userData;
    } else {
        console.log("No such document!");
        return null;
    }
}




export const createGroup = async (title, description, image, members) => {
    const groupsCollectionRef = collection(db, "groups")
    const user = await getUserData()
    try {
        let imageUrl = ""
        if (image != null) {
            const imageRef = ref(storage, `groups/${title}/banner`);
            await uploadBytes(imageRef, image);
            imageUrl = await getDownloadURL(imageRef);
        }
        const res = await addDoc(groupsCollectionRef, {
            title: title,
            description: description,
            createdAt: serverTimestamp(),
            creator: user.uid,
            imgUrl: imageUrl,
            memberInfo: members
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
        added: dayjs().format('YYYY-MM-DD')
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
    const user = await getUserData()
    try {
        let imageUrl = ""
        if (image != null) {
            const imageRef = ref(storage, `groups/${groupId}/posts/${user.uid}/${uuid()}`);
            await uploadBytes(imageRef, image);
            imageUrl = await getDownloadURL(imageRef);
        }
        const res = await addDoc(postsCollectionRef, {
            name: user.fullName,
            content: content,
            imgUrl: imageUrl,
            uid: user.uid,
            posted: serverTimestamp()
        })
        return { res: res, status: "ok" }
    } catch (error) {
        return error
    }
}


// skal i teorien overskrive det som er 
export const updateGroupInfo = async (group, groupId) => {
    const groupDoc = doc(db, "groups", groupId)
    try {
        let imageUrl = group.imgUrl
        if (group.newImg != null) {
            const imageRef = ref(storage, `groups/${group.oldTitle}/banner`);
            await uploadBytes(imageRef, group.newImg);
            imageUrl = await getDownloadURL(imageRef);
        }
        const res = await updateDoc(groupDoc, {
            title: group.title,
            description: group.description,
            imgUrl: imageUrl,

        })
        return { res: res, status: "ok" }
    } catch (error) {
        return (error)
    }



}