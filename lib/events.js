import { auth, db, storage } from "./firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { serverTimestamp, setDoc, doc, addDoc, collection, getDocs, updateDoc, arrayUnion } from "firebase/firestore";
import { uuid } from 'uuidv4';
///uuidv4 is depricated. så denne må eg fikse

//const userID = "7Xb3FhzT1UUdP5BeB84GNwQfnQo1"


/** 
 vurderer å erstatte userID logikken med denne
const getUserId = () => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User is not authenticated');
    }
    return user.uid;
  };
 */

export const createNewEvent = async (title, description, location, date, image, members, creator) => {

    const userID = auth.currentUser.uid
    const eventCollectonRef = collection(db, "events")
    try {
        let imageUrl = ""
        if (image != null) {
            const imageRef = ref(storage, `events/${title}/banner/${uuid()}`);
            await uploadBytes(imageRef, image);
            imageUrl = await getDownloadURL(imageRef);
        }
        const res = await addDoc(eventCollectonRef, {
            title: title,
            description: description,
            date: date,
            created: serverTimestamp(),
            memberInfo: members,
            creator: creator,
            location: location,
            imgUrl: imageUrl
        })
        return { res: res, status: "ok" }
    } catch (error) {
        return error
    }
}


export const addMember = async (eventId, user) => {
    const userID = auth.currentUser.uid
    const memberDocRef = doc(db, "events", eventId)
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

export const addPost = async (eventId, content, image) => {
    const userID = auth.currentUser.uid
    const postsCollectionRef = collection(db, "groups", eventId, "posts")
    try {
        let imageUrl = ""
        if (image != null) {
            const imageRef = ref(storage, `groups/${eventId}/posts/${userID}/${uuid()}`);
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



//
export const updateAttendes = async (eventId, attendenceValue) => {
    const userID = auth.currentUser.uid
    const docRef = collection(db, "users", userID)
    try {
        const res = await setDoc(docRef, {
            memberId: userID,
            attendance: attendenceValue,
            updates: serverTimestamp(),
        })
        if (res) {
            await updateDoc(docRef, {
                arrangmenter: arrayUnion(eventId)
            })
        }
        return { res: res, status: "ok" }

    } catch (error) {
        return error
    }


    //const res = await updateDoc(docRef, {
    //    arrangmenter: arrayUnion(docId)
    // })
}