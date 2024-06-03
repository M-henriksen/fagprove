"use client"
import React, { useState, useEffect } from 'react'
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { db } from '@/lib/firebase'
import { onSnapshot, doc, collection, query, where, getDocs } from 'firebase/firestore'
import { addPost } from '@/lib/events'
import { auth } from '@/lib/firebase'

export default function Events({ params }) {
    //params.id
    const docId = params.id
    const docRef = doc(db, "events", docId)
    const postsCollectionRef = collection(db, "events", docId, "posts")
    const attendanceCollectionRef = collection(db, "events", docId, "attendance")

    const [event, setEvent] = useState({ memberInfo: [] })
    const [posts, setPosts] = useState([])
    const [comment, setComment] = useState("")

    const [attendanceStatus, setAttendanceStatus] = useState("")

    console.log(event)

    useEffect(() => {
        const unsubGroup = onSnapshot(docRef, (docSnapshot) => {
            console.log(docSnapshot);
            if (docSnapshot.exists()) {
                setEvent(docSnapshot.data());
            }
        });

        //må ha en fuksjon som henter attendence statusen på bruker

        //q parameter og sort på tid

        const unsubPosts = onSnapshot(postsCollectionRef, (snapshot) => {
            const data = snapshot.docs.map((doc) => {
                return { id: doc.id, ...doc.data() };
            });
            setPosts(data);
        });

        return () => {
            unsubGroup();
            unsubPosts();

        };
    }, []);


    const handleAttendanceStatus = async () => {

    }

    console.log("Kommentar", comment)
    const handlePostComment = async () => {

        const getUserData = async () => {
            const userID = auth.currentUser.uid
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("uid", "==", userID))
            const userData = await getDocs(q);
            let users = userData.docs.map(doc => doc.data());

            console.log(users)
            return users[0]
        }

        getUserData()

        console.log("runs")
        try {
            const res = await addPost(docId, comment)
            console.log("svar", res)
        } catch (error) {
            console.log(error)
            return error
        }

    }

    return (
        <div className='flex flex-col p-10 gap-5 w-[60vw]'>
            <div className='relative w-full h-[300px]'>
                <img src="https://miro.medium.com/v2/resize:fit:1400/1*ydhn1QPAKsrbt6UWfn3YnA.jpeg" alt="img" className='w-full h-full object-cover rounded-md' />
                <div className='absolute inset-0 flex  top-12 left-12'>
                    <span className=' text-white text-3xl font-bold'>{event.title}</span>
                </div>
            </div>
            <div className='flex flex-col gap-4'>
                <div className='flex justify-between gap-3'>
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Inviterte</CardTitle>
                            <CardDescription>Se påmeldte</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            {
                                event.memberInfo.slice(0, 5).map((member) => (
                                    <span key={member.uid}>{member.fullName}</span>
                                ))
                            }
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button variant="ghost">se mer</Button>
                        </CardFooter>
                    </Card>

                    <div className='flex flex-col gap-3'>
                        <div className='flex flex-col gap-2 text-left'>
                            <Label className="text-xl font-bold">Attendance</Label>
                            <div className='flex gap-3'>
                                <Button variant={attendanceStatus === "yes" ? "" : "outline"} onClick={() => { handleAttendanceStatus("yes"), setAttendanceStatus("yes") }}>Ja</Button>
                                <Button variant={attendanceStatus === "no" ? "" : "outline"} onClick={() => { handleAttendanceStatus("no"), setAttendanceStatus("no") }}>Nei</Button>
                                <Button variant={attendanceStatus === "maybe" ? "" : "outline"} onClick={() => { handleAttendanceStatus("maybe"), setAttendanceStatus("maybe") }}>Kanskje</Button>
                            </div>
                        </div>

                        <div className='flex flex-col gap-2'>
                            <Label className="text-xl font-bold">dato og tid</Label>
                            <span>{event.date}</span>
                        </div>

                        <div className='flex flex-col gap-2'>
                            <Label className="text-xl font-bold">Lokasjon</Label>
                            <span>{event.location}</span>
                        </div>


                    </div>
                </div>




                <div>
                    <Label className="text-xl font-bold w-full">Event beskrivelse</Label>
                    <p>
                        {event.description}
                    </p>
                </div>

                <Label className="text-xl font-bold">Kommentarer</Label>
                <div>
                    {posts.map((post) => (
                        <Card key={post.id}>
                            <CardHeader>
                                <CardTitle>{post.name}</CardTitle>
                                <CardDescription>{post.posted[0]}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {post.content}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className='flex gap-2'>
                    <div className="flex flex-col w-full gap-2">
                        <Label htmlFor="title">Send inn kommentar</Label>
                        <Input id="title" className="w-full" placeholder="Event navn" onChange={(e) => setComment(e.target.value)} />
                    </div>
                    <div className='flex flex-col justify-end'>
                        <Button onClick={handlePostComment}>Send</Button>
                    </div>

                </div>


            </div>
        </div>
    )
}

