"use client"
import React, { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, onSnapshot } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
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
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { createGroup } from '@/lib/group'
//import Image from 'next/image'
import Image from "@/components/background.jpg"

import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

export default function Events() {
    const router = useRouter()
    const [data, setData] = useState([])
    const [groupTitle, setGroupTitle] = useState("")
    const [groupDescription, setGroupDescription] = useState("")
    const [groupImage, setGroupImage] = useState(null)
    const groupCollectionRef = collection(db, "groups")

    //trenger q parameter for sortering av grupper
    useEffect(() => {

        const unsubUser = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
               // setUser(currentUser)
            } else {
                router.push("/login")
            }
        });

        const unsubscribe = onSnapshot(groupCollectionRef, (snapshot) => {
            const data = snapshot.docs.map((doc) => {
                return { id: doc.id, ...doc.data() };
            });
            setData(data);
        });
        return () => {
            unsubUser()
            unsubscribe();
        
        };
    }, []);

    const handleAddGroup = async () => {

        console.log(groupTitle, groupDescription, groupImage)
        const res = await createGroup(groupTitle, groupDescription, groupImage)
        console.log(res)
    }
    const handleRedirect = (id) => {
        router.push(`groups/${id}`)
    }


    return (
        <div className='flex flex-col p-10 gap-5'>
            <div className='relative w-[80vw] h-[300px]'>
                <img src="https://miro.medium.com/v2/resize:fit:1400/1*ydhn1QPAKsrbt6UWfn3YnA.jpeg" alt="img" className='w-full h-full object-cover' />
                <div className='absolute inset-0 flex  top-12 left-12'>
                    <span className=' text-white text-3xl font-bold'>Se alle gruppene</span>
                </div>
            </div>
            <div className='flex gap-3 flex-col '>
                <Label className="text-2xl font-semibold">Opprett ny gruppe</Label>
                <div className='flex gap-4'>
                    <div>
                        <Label htmlFor="group-tittle">Gruppenavn</Label>
                        <Input
                            id="group-tittle"
                            placeholder="Gruppenavn"
                            onChange={(e) => { setGroupTitle(e.target.value) }}
                        />
                    </div>
                    <div>
                        <Label htmlFor="group-description">Beskrivelse</Label>
                        <Textarea
                            id="group-description"
                            placeholder="Beskrivelse"
                            onChange={(e) => { setGroupDescription(e.target.value) }}
                        />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <Label htmlFor="group-img">Bilde</Label>
                        <Input
                            id="group-img"
                            type="file"
                            onChange={(e) => { setGroupImage(e.target.files[0]) }}
                        />
                        <Button onClick={handleAddGroup}>Opprett</Button>
                    </div>
                </div>
            </div>
            <div className='flex flex-col gap-3'>
                <Label className="text-2xl font-semibold">Grupper</Label>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {data.map((group, index) => (
                        <Card className="col-span-2 sm:col-span-2" key={group.id}>
                            <CardHeader>
                                <CardTitle>{group.title}</CardTitle>
                                <CardDescription>{group.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-row gap-3">
                                {
                                    group.imgUrl
                                        ? <img src={group.imgUrl} alt="Feil ved henting av bilde" className=' w-40 h-28 object-cover' />
                                        : null
                                }
                                <div className='flex flex-col gap-2'>
                                    <Label className="text-l font-semibold">Medlemmer:</Label>
                                    <div className='flex flex-col'>
                                        {group.memberInfo.slice(0, 5).map((member, index) => (
                                            <span key={index}>{member.fullName}</span>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Button variant="ghost" onClick={() => handleRedirect(group.id)}>Les mer</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
