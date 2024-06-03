import { auth, db, storage } from "./firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { serverTimestamp, setDoc, doc, addDoc, collection, getDocs, updateDoc, arrayUnion, query, where } from "firebase/firestore";
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


  //om bruker id stemmer med dokuemt id kan jeg heller hente dokument istedenfor

  const getUserData = async () => {
    const userID = auth.currentUser.uid
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", userID))
    const userData = await getDocs(q);
    let users = userData.docs.map(doc => doc.data());
    return users[0]
}


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
    }else{
        return "Mangler bruker"
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
            switch (attendenceValue) {
                case ("yes"):
                    await updateDoc(docRef, {
                        arrangmenter: arrayUnion(eventId)
                    })
                    break
                case ("no"):
                    await updateDoc(docRef, {
                        arrangmenter: arrayRemove(eventId)
                    })
                    break
                case ("maybe"):
                    await updateDoc(docRef, {
                        arrangmenter: arrayRemove(eventId)
                    })
                    break
            }
        }
        return { res: res, status: "ok" }

    } catch (error) {
        return error
    }


    //const res = await updateDoc(docRef, {
    //    arrangmenter: arrayUnion(docId)
    // })
}