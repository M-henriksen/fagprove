import { auth, db, storage } from "./firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { serverTimestamp, setDoc, doc, addDoc, collection, getDocs, updateDoc, arrayUnion, query, where, getDoc } from "firebase/firestore";
import { uuid } from 'uuidv4';
///uuidv4 is depricated. så denne må eg fikse
import dayjs from 'dayjs'

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


//om bruker id stemmer med dokuemt id kan jeg heller hente dokument istedenfor
{/** 
const getUserData = async () => {
    const userID = auth.currentUser.uid
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", userID))
    const userData = await getDocs(q);
    let users = userData.docs.map(doc => doc.data());
    return users[0]
}
*/}

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


export const addMember = async (eventId, user) => {
    //const user = await getUserData()
    const docRef = doc(db, "users", user.uid, "events", eventId)
    const eventDocRef = doc(db, "events", eventId, "attendence", user.uid)
    try {
        const res = setDoc(docRef, {
            eventId: eventId,
            uid: user.uid,
            name: user.fullName,
            updated: serverTimestamp(),
            attendence: ""
        })
        const eventRes = setDoc(eventDocRef, {
            eventId: eventId,
            uid: user.uid,
            name: user.fullName,
            updated: serverTimestamp(),
            attendence: ""

        })
        return { res: res, eventres: eventRes, status: "ok" }
    } catch (error) {
        return error
    }
}

export const createNewEvent = async (title, description, location, date, image, creator, groupId) => {
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
            creator: creator,
            location: location,
            imgUrl: imageUrl,
            groupId: groupId
        })
        return { res: res, status: "ok" }
    } catch (error) {
        return error
    }
}




export const addPost = async (eventId, content) => {
    const user = await getUserData()
    const postsCollectionRef = collection(db, "events", eventId, "posts")
    if (user) {
        try {
            const res = await addDoc(postsCollectionRef, {
                name: user.fullName,
                content: content,
                posted: serverTimestamp()
            })
            return { res: res, status: "ok" }
        } catch (error) {
            return error
        }
    } else {
        return "Mangler bruker"
    }
}



export const updateAttendes = async (eventId, attendenceValue, exists) => {
    //lager ett nytt dokument i en subcollection og lagrer navn
    const user = await getUserData()
    const docRef = doc(db, "users", user.uid, "events", eventId)
    const eventDocRef = doc(db, "events", eventId, "attendence", user.uid)
    if (exists == "") {
        try {
            const res = setDoc(docRef, {
                eventId: eventId,
                uid: user.uid,
                name: user.fullName,
                updated: serverTimestamp(),
                attendence: attendenceValue

            })

            const eventRes = setDoc(eventDocRef, {
                eventId: eventId,
                uid: user.uid,
                name: user.fullName,
                updated: serverTimestamp(),
                attendence: attendenceValue

            })
            return { res: res, eventres: eventRes, status: "ok" }
        } catch (error) {
            return error
        }
    } else {
        try {
            const res = updateDoc(eventDocRef, {
                attendence: attendenceValue
            })
            const eventRes = updateDoc(docRef, {
                attendence: attendenceValue
            })
            return { res: res, eventres: eventRes, status: "ok" }
        } catch (error) {
            return error
        }
    }
}