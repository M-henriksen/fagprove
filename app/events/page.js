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
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Badge } from "@/components/ui/badge"
import { db } from '@/lib/firebase'
import { collection, onSnapshot, where, query } from 'firebase/firestore'
//import Image from 'next/image'
import Image from "@/components/background.jpg"
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'

export default function Events() {
    const router = useRouter()
    const eventsCollectionRef = collection(db, "events")
    const [user, setUser] = useState("")
    const [events, setEvents] = useState([])


    const [categories, setCategories] = useState([
        { id: 1, title: "alle", value: false, qValue: user.uid, qParam: "creator" },
        { id: 2, title: "Gruppe 2", value: false },
        { id: 3, title: "Gruppe 3", value: false },
        { id: 4, title: "Gruppe 4", value: false },
    ])
    const [qParam, setQParam] = useState("")

    const handleToggle = (id, title) => {
        setCategories(categories.map(category =>
            category.id === id
                ? { ...category, value: true }
                : { ...category, value: false }
        ));

        setQParam({ qValue: user.uid, param: "creator" });
    };

    useEffect(() => {
        const unsubUser = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser)
            } else {
                router.push("/login")
            }
        });
        //lag heller en switch på riktig kategori

        const evnetsCollectionRef = collection(db, "events")
        const q = query(evnetsCollectionRef, where(qParam.qValue === qParam.param))
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

    const handleRedirect = () => {

    }

    return (
        <div className='flex flex-col p-10 gap-5'>
            <div className='relative w-[80vw] h-[300px]'>
                <img src="https://miro.medium.com/v2/resize:fit:1400/1*ydhn1QPAKsrbt6UWfn3YnA.jpeg" alt="img" className='w-full h-full object-cover' />
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
                    <DialogTrigger className='ml-5'>Lag nytt arrangement</DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will permanently delete your account
                                and remove your data from our servers.
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </div>
            <div>
                <Card className="w-fit">
                    <CardHeader>
                        <CardTitle>Gruppe møte</CardTitle>
                        <CardDescription>Join us for a fun group meetup at the local cafe</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-row gap-3">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHKEBak-4eVMbinGqXuaH_TJKFQuePXrpixg&s" alt="" className=' w-40 h-28 object-cover' />
                        <div className='flex flex-col gap-2'>
                            <Label className="text-l font-semibold">Dato: 24 Jun at 16:30</Label>
                            <Label className="text-l font-semibold">Medlemmer:</Label>
                            <div className='flex flex-col'>
                                <span>eht</span>
                                <span>eht</span>
                                <span>eht</span>
                                <span>eht</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button variant="ghost" onClick={handleRedirect()}>Les mer</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
