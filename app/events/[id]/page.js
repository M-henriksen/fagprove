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
import { onSnapshot, doc, collection } from 'firebase/firestore'

export default function Events({ params }) {
    //params.id
    const docId = params.id
    const docRef = doc(db, "events", docId)
    const postsCollectionRef = collection(db, "events", docId, "posts")

    const [event, setEvent] = useState({})
    const [posts, setPosts] = useState([])
    const [attendanceStatus, setAttendanceStatus] = useState("")

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
            unsubPosts()
        };
    }, []);


    const handleAttendanceStatus = async () => {

    }

    return (
        <div className='flex flex-col p-10 gap-5'>
            <div className='relative w-full h-[300px]'>
                <img src="https://miro.medium.com/v2/resize:fit:1400/1*ydhn1QPAKsrbt6UWfn3YnA.jpeg" alt="img" className='w-full h-full object-cover' />
                <div className='absolute inset-0 flex  top-12 left-12'>
                    <span className=' text-white text-3xl font-bold'>{event.title}</span>
                </div>
            </div>
            <div className='flex flex-col gap-4'>
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-2'>
                        <Label className="text-xl font-bold">dato og tid</Label>
                        <span>{event.date}</span>
                    </div>

                    <div className='flex flex-col gap-2'>
                        <Label className="text-xl font-bold">Lokasjon</Label>
                        <span>{event.location}</span>
                    </div>

                    <div className='flex flex-col gap-2 text-center'>
                        <Label className="text-xl font-bold">Attendance</Label>
                        <div className='flex gap-3'>
                            <Button variant={attendanceStatus === "yes" ? "" : "outline"} onClick={() => { handleAttendanceStatus("yes"), setAttendanceStatus("yes") }}>Ja</Button>
                            <Button variant={attendanceStatus === "no" ? "" : "outline"} onClick={() => { handleAttendanceStatus("no"), setAttendanceStatus("no") }}>Nei</Button>
                            <Button variant={attendanceStatus === "maybe" ? "" : "outline"} onClick={() => { handleAttendanceStatus("maybe"), setAttendanceStatus("maybe") }}>Kanskje</Button>
                        </div>
                    </div>
                </div>

                <div>
                    <Label className="text-xl font-bold">Event beskrivelse</Label>
                    <p>
                        Join us for our annual charity gala, where well be raising funds for the local community.
                        This years event will feature a silent auction, live music, and a delicious dinner.
                        Dress to impress and get ready for a night of fun and philanthropy!
                    </p>
                </div>

                <Label className="text-xl font-bold">Kommentarer</Label>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>John doe</CardTitle>
                            <CardDescription>Dato tid</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Im so excited for this event! Cant wait to see everyone there. </p>
                        </CardContent>
                    </Card>
                </div>

                <div className='flex gap-2'>
                    <Input />
                    <Button>Submit</Button>
                </div>


            </div>
        </div>
    )
}

