"use client"
import React, { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
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
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel
} from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { Badge } from "@/components/ui/badge"
import { db } from '@/lib/firebase'
import { collection, onSnapshot, where, query, getDocs } from 'firebase/firestore'
//import Image from 'next/image'
import Image from "@/components/background.jpg"
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { createNewEvent } from '@/lib/events'
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import dayjs from "dayjs"

export default function Events() {
    const router = useRouter()
    const eventsCollectionRef = collection(db, "events")
    const [user, setUser] = useState("")
    const [users, setUsers] = useState([])
    const [events, setEvents] = useState([])
    const [userToAdd, setUserToAdd] = useState({})
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [date, setDate] = useState()
    const [image, setImage] = useState(null)
    const [location, setLocation] = useState("")
    const [addingMember, setAddingMember] = useState([])

    const [categories, setCategories] = useState([
        { id: 1, title: "Alle", value: false, qValue: user.uid, qParam: "creator" },
        { id: 2, title: "Skal på", value: false },
        { id: 3, title: "Kanskje skal", value: false },
        { id: 4, title: "Innen en uke", value: false },
    ])
    const [qParam, setQParam] = useState({ qValue: "creator", param: "SY9pmFtGFyXocwcMPMIvsmAUsAh1" })

    const handleToggle = (id, title) => {
        setCategories(categories.map(category =>
            category.id === id
                ? { ...category, value: true }
                : { ...category, value: false }
        ));
        setQParam({ qValue: user.uid, param: "creator" });
    };

    console.log(qParam)
    useEffect(() => {
        const unsubUser = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser)
            } else {
                router.push("/login")
            }
        });



        //param som mine arrangmeneter, skal på. kanskje skal på. innen en uke. og i dag

        const evnetsCollectionRef = collection(db, "events")
        const q = query(evnetsCollectionRef, where("creator", "==", "7Xb3FhzT1UUdP5BeB84GNwQfnQo1"))
        console.log("viser querry", q)
        const unsubscribeEvents = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => {
                return { id: doc.id, ...doc.data() };
            });
            setEvents(data);
        });

        return () => {
            unsubUser()
            unsubscribeEvents()
        }
    }, []);

    console.log("Event data:", events)

    const handleRedirect = (id) => {
        router.push(`/events/${id}`)
    }

    const handleGetUsers = async () => {
        console.log("did run get user");
        const usersRef = collection(db, "users");
        try {
            const userData = await getDocs(usersRef);
            const users = userData.docs.map(doc => doc.data());
            setUsers(users);
        } catch (error) {
            console.error("Error getting documents: ", error);
        }
    }

    const handleCreatingNewGroup = async () => {
        try {
            const res = await createNewEvent(title, description, date, location, image, addingMember, user.uid,)
            console.log(res)

        } catch (error) {
            console.log(error)
        }
    }

    const addingNewMembers = () => {
        const fullName = userToAdd.firstName + " " + userToAdd.lastName
        setAddingMember([...addingMember, { added: dayjs().format('YYYY-MM-DD'), fullName: fullName, uid: userToAdd.uid }])
    }

    console.log("adding members", addingMember)

    return (
        <div className='flex flex-col p-10 gap-5'>
            <div className='relative w-[80vw] h-[350px]'>
                <img src="https://miro.medium.com/v2/resize:fit:1400/1*ydhn1QPAKsrbt6UWfn3YnA.jpeg" alt="img" className='w-full h-full object-cover rounded-md' />
                <div className='absolute inset-0 flex  top-12 left-12'>
                    <span className=' text-white text-3xl font-bold'>Se alle nye eventer</span>
                </div>
            </div>

            <div className='flex gap-3'>
                {categories.map((item) => (
                    <Badge key={item.id} variant={item.value ? "" : "outline"} onClick={() => handleToggle(item.id, item.title)}>
                        {item.title}
                    </Badge>
                ))}
                <Dialog>
                    <DialogTrigger className='ml-5' onClick={handleGetUsers}>Lag nytt arrangement</DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Legg til nytt arrangement</DialogTitle>
                            <DialogDescription>
                                Her kan du opprette ett nytt arrangement, velg ett navn en beskrivelse. Sett en dato inviter brukere
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="title">Tittel</Label>
                                <Input id="title" placeholder="Event navn" onChange={(e) => setTitle(e.target.value)} />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="pic">Bilde</Label>
                                <Input id="pic" type="file" onChange={(e) => setImage(e.target.files[0])} />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="description">Beskrivelse</Label>
                                <Textarea id="description" placeholder="Beskrivelse" onChange={(e) => setDescription(e.target.value)} />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="datetime">Dato</Label>
                                <Input type="datetime-local" onChange={(e) => setDate(e.target.value)} />
                            </div>

                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="datetime">Lokasjon</Label>
                                <Input type="datetime-local" onChange={(e) => setLocation(e.target.value)} />
                            </div>

                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="date">Medlem som er lagt til</Label>
                                {addingMember.map((member, index) => (
                                    <span key={index}>{member.fullName}</span>
                                ))}
                            </div>
                            <div className='flex gap-3 w-full'>
                                <Select onValueChange={(value) => setUserToAdd(value)} >
                                    <SelectTrigger>
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
                                                <SelectItem key={user.uid} value={user}>{user.firstName} {user.lastname}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <Button onClick={addingNewMembers}>Legg til medlem</Button>
                            </div>
                        </div>
                        <DialogFooter className="w-full mt-5">
                            <Button type="submit" className="w-full" onClick={handleCreatingNewGroup}>Opprett event</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <div>
                {events.map((event, index) => (
                    <Card className="w-fit" key={index}>
                        <CardHeader>
                            <CardTitle>{event.title}</CardTitle>
                            <CardDescription>{event.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-row gap-3">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHKEBak-4eVMbinGqXuaH_TJKFQuePXrpixg&s" alt="" className=' w-40 h-28 object-cover' />
                            <div className='flex flex-col gap-2'>
                                <Label className="text-l font-semibold">Dato: {event.date}</Label>
                                <Label className="text-l font-semibold">Medlemmer:</Label>
                                <div className='flex flex-col'>
                                    {event.memberInfo.slice(0, 5).map((member, index) => (
                                        <span key={index}>{member.fullName}</span>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button variant="ghost" onClick={() => handleRedirect(event.id)}>Les mer</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
