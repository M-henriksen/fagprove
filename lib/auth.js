import { auth, db, storage } from "./firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { serverTimestamp, setDoc, doc } from "firebase/firestore";




export const signIn = async (email, password) => {
    try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        return {
            res: res,
            status: "ok"
        }
    } catch (error) {
        console.log(error)
        return error
    }
}

{/** lager bruker med firebase auth men lager også ett dokument i en users collection i firestore 
     dokumentene blir brukt flere plasser der det er hensiktsmessing med brukerinformasjon
*/}
export const signUp = async (firstName, lastName, email, password, profilePicture) => {
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password)
        console.log(res)
        if (res) {
            const userData = res.user
            const userDocRef = doc(db, 'users', userData.uid);
            let fullName = firstName + " " + lastName
            let imageUrl = "";
            if (profilePicture != null) {
                const imageRef = ref(storage, `users/${userData.uid}/profile`);
                await uploadBytes(imageRef, profilePicture);
                imageUrl = await getDownloadURL(imageRef);
            }
            await setDoc(userDocRef, {
                firstName: firstName,
                lastName: lastName,
                fullName: fullName,
                email: email,
                uid: userData.uid,
                profilePicture: imageUrl,
                createdAt: serverTimestamp()
            })
        }
        return {
            res: res,
            status: "ok"
        }
    } catch (error) {
        return error
    }
}

export const resetPassword = async (resetEmail) => {

}