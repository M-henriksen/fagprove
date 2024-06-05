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
import { Button } from '@/components/ui/button'
import { Badge } from "@/components/ui/badge"
import { db } from '@/lib/firebase'
import { collection, onSnapshot, where, query, } from 'firebase/firestore'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import dayjs from "dayjs"

export default function Events() {
    const router = useRouter()
    const [user, setUser] = useState("")

    const [events, setEvents] = useState([])

    // her ønsket jeg egentlig å kunne legge til flere ting som arrangmenter man kanskje skal på eller skal på osv
    const [categories, setCategories] = useState([
        { id: 1, title: "Alle", value: true, qValue: "", param: "", },
        { id: 2, title: "Innen en uke", value: false, qValue: dayjs().add(1, 'week').format("YYYY-MM-DD HH:mm"), param: "date", },
    ])


    const [qParam, setQParam] = useState({ qValue: "", param: "" })


    const handleToggle = (id) => {
        const selectedCategory = categories.find(category => category.id === id);
        setCategories(categories.map(category =>
            category.id === id
                ? { ...category, value: true }
                : { ...category, value: false }
        ));
        setQParam({ qValue: selectedCategory.qValue, param: selectedCategory.param })
    }

    useEffect(() => {

        const unsubUser = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser)
            } else {
                router.push("/login")
            }
        });

    {/** har to forskjellige q verdier da collection henter alt. men man må ha query for å kunne ha queryparameter */}

        const evnetsCollectionRef = collection(db, "events")
        let q = evnetsCollectionRef;
        if (qParam.qValue !== "" && qParam.param !== "") {
            q = query(evnetsCollectionRef, where(qParam.param, "<=", qParam.qValue));
        }
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
    }, [qParam]);


    const handleRedirect = (id) => {
        router.push(`/events/${id}`)
    }


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

                {/** hadde tenkte å gjøre det mulig å opprette eventer her også men hadde ikkje tida å gjøre det på en sikkelig måte */}

            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {events.map((event, index) => (
                    <Card className="w-fit " key={index}>
                        <CardHeader>
                            <CardTitle>{event.title}</CardTitle>
                            <CardDescription>{event.description}</CardDescription>
                            <Label className="text-l font-semibold">Dato: {event.date}</Label>
                        </CardHeader>
                        <CardContent className="flex flex-row gap-3">
                            <img src={event.imgUrl} alt="" className=' w-40 h-28 object-cover rounded-md' />
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button variant="ghost" onClick={() => handleRedirect(event.id)}>Se mer</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
