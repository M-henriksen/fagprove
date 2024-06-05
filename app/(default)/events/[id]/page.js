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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { db } from '@/lib/firebase'
import { onSnapshot, doc, collection, query, where, getDocs } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { addPost } from '@/lib/events'
import { auth } from '@/lib/firebase'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { updateAttendes, addMember } from '@/lib/events'


export default function Events({ params }) {
    const router = useRouter()
    const docId = params.id
    const docRef = doc(db, "events", docId)
    const postsCollectionRef = collection(db, "events", docId, "posts")
    //const attendanceCollectionRef = collection(db, "events", docId, "attendance")
    const [event, setEvent] = useState({ memberInfo: [] })
    const [posts, setPosts] = useState([])
    const [user, setUser] = useState({})
    const [comment, setComment] = useState("")
    const [attendants, setAttendants] = useState([])
    const [attendanceStatus, setAttendanceStatus] = useState("")
    const [users, setUsers] = useState([])
    const [member, setMember] = useState({})

    useEffect(() => {
        const unsubUser = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser)
            } else {
                router.push("/login")
            }
        });
        const unsubGroup = onSnapshot(docRef, (docSnapshot) => {
            console.log(docSnapshot);
            if (docSnapshot.exists()) {
                setEvent(docSnapshot.data());
            }
        });


        {/** 
        const statusDocRef = doc(db, "users", `${user.uid}`, "events", docId)
        const unsubAttendeceStatus = onSnapshot(statusDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                setAttendanceStatus(docSnapshot.data().attendence)
            }
        })
        */}


        const attendanceCollectionRef = collection(db, "events", docId, "attendence")

        const unsubAttendece = onSnapshot(attendanceCollectionRef, (snapshot) => {
            const data = snapshot.docs.map((doc) => {
                let updated = dayjs(doc.data.updated).format("DD-MM-YYYY HH:mm")
                return { id: doc.id, ...doc.data(), updated };
            });
            setAttendants(data);
        });


        //      const userDocRef = doc(db, "users", `${user.uid}`)

        //q parameter og sort på tid
        const unsubPosts = onSnapshot(postsCollectionRef, (snapshot) => {
            const data = snapshot.docs.map((doc) => {
                let posted = dayjs(doc.data.posted).format("DD-MM-YYYY HH:mm")
                return { id: doc.id, ...doc.data(), posted };
            });
            setPosts(data);
        });
        return () => {
            unsubUser()
            unsubAttendece()
            unsubGroup();
            unsubPosts();
        };
    }, [user]);


    console.log("status", attendanceStatus)

    const handleAttendanceStatus = async (value) => {
        try {
            const res = await updateAttendes(docId, value, attendanceStatus)
            console.log(res)
        } catch (error) {
            console.log(error)
        }
    }

    const handleGetUsers = async () => {
        const usersRef = collection(db, "users");
        try {
            const userData = await getDocs(usersRef);
            const users = userData.docs.map(doc => doc.data());
            setUsers(users);
        } catch (error) {
            console.error("Error getting documents: ", error);
        }
    }

    const handlePostComment = async () => {
        console.log("runs")
        try {
            const res = await addPost(docId, comment)
            console.log("svar", res)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const handleAddingMember = async () => {
        try {
            const res = await addMember(docId, member)
            console.log(res)
            toast({
                title: "Medlem lagt til",
                description: `${member.firstName} ble invitert til eventet`,
            })

            console.log(res)
        } catch (error) {
            console.log(error)
            //  toast({
            //      variant: "destructive",
            //      title: "Det har skjedd en feil",
            //      description: error,
            // })
        }
    }

    console.log("inviterte status", attendants)

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
                        <CardContent className="flex flex-col gap-1">
                            {
                                attendants.slice(0, 5).map((person) => (
                                    <span key={person.uid}>{person.name}</span>
                                ))
                            }
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <div className='flex flex-col gap-3'>
                                <Dialog>
                                    <DialogTrigger>Se alle</DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Alle inviterte</DialogTitle>
                                            <DialogDescription>
                                                Her kan du se alle som er inviterte til dette eventet
                                            </DialogDescription>
                                        </DialogHeader>
                                        {
                                            attendants.map((person) => (
                                                <div key={person.uid} className='flex gap-2'>
                                                    <span>{person.name}</span>
                                                    <span>invitert: {person.updated}</span>
                                                    <span>status: {person.attendence}</span>
                                                    {/* vist jeg får tid kan jeg lage en profil side også 
                                                <Button variant="ghost">les mer</Button>
                                                */}
                                                </div>
                                            ))
                                        }
                                    </DialogContent>
                                </Dialog>

                                <Dialog>
                                    <DialogTrigger onClick={handleGetUsers}>Legg til medlem</DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Legg til medlem</DialogTitle>
                                            <DialogDescription>
                                                Velg bruker og legg til
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className='flex gap-3'>
                                            <Select onValueChange={(value) => setMember(value)} >
                                                <SelectTrigger className="w-[180px]" >
                                                    <SelectValue placeholder="Velg en bruker" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {
                                                            users.length === 0
                                                                ? <SelectLabel>Laster brukere ... </SelectLabel>
                                                                : <SelectLabel>Brukere</SelectLabel>
                                                        }
                                                        {users.map((user) => (
                                                            <SelectItem key={user.id} value={user}>{user.firstName} {user.lastname}</SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <Button onClick={handleAddingMember}>Legg til medlem</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                            </div>

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
                <div className='flex flex-col gap-3'>
                    {posts.map((post) => (
                        <Card key={post.id}>
                            <CardHeader>
                                <CardTitle>{post.name}</CardTitle>
                                <CardDescription>{post.posted}</CardDescription>
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

