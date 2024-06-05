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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { createGroup } from '@/lib/group'
//import Image from 'next/image'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'

export default function Events() {
    const router = useRouter()
    const [data, setData] = useState([])
    const [userToAdd, setUserToAdd] = useState({})
    const [users, setUsers] = useState([])
    const [addingMember, setAddingMember] = useState([])
    const [newGroupInfo, setNewGroupInfo] = useState({ title: "", description: "", img: null })
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

    const handleEditGroupInfo = (e, key) => {
        const value = key === "img" ? e.target.files[0] : e.target.value;
        setNewGroupInfo({ ...newGroupInfo, [key]: value });
    };

    console.log("newGroupInfo ", newGroupInfo)


    const addingNewMembers = () => {
        setAddingMember([...addingMember, { added: dayjs().format('YYYY-MM-DD HH:mm'), fullName: userToAdd.fullName, uid: userToAdd.uid }])
    }

    const handleAddGroup = async () => {
        const res = await createGroup(newGroupInfo.title, newGroupInfo.description, newGroupInfo.img, addingMember)
        console.log(res)
    }
    const handleRedirect = (id) => {
        router.push(`groups/${id}`)
    }


    return (
        <div className='flex flex-col p-10 gap-5'>
            <div className='relative w-[80vw] h-[300px]'>
                <img src="https://miro.medium.com/v2/resize:fit:1400/1*ydhn1QPAKsrbt6UWfn3YnA.jpeg" alt="img" className='w-full h-full object-cover rounded-md' />
                <div className='absolute inset-0 flex  top-12 left-12'>
                    <span className=' text-white text-3xl font-bold'>Se alle gruppene</span>
                </div>
            </div>
            <div className='flex gap-3 flex-col '>
                <Dialog>
                    <DialogTrigger className='flex' onClick={handleGetUsers}>Opprett ny gruppe</DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Opprett gruppe</DialogTitle>
                            <DialogDescription>
                                Her kan du opprette en ny gruppe, velg ett navn en beskrivelse. inviter brukere
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="title">Tittel</Label>
                                <Input id="title" placeholder="Event navn" onChange={(e) => { handleEditGroupInfo(e, "title") }} />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="pic">Bilde</Label>
                                <Input id="pic" type="file" onChange={(e) => { handleEditGroupInfo(e, "img") }} />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="description">Beskrivelse</Label>
                                <Textarea id="description" placeholder="Beskrivelse" onChange={(e) => { handleEditGroupInfo(e, "description") }} />
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
                            <Button type="submit" className="w-full" onClick={handleAddGroup}>Opprett event</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
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
                                        ? <img src={group.imgUrl} alt="Feil ved henting av bilde" className=' w-40 h-28 object-cover rounded-md' />
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
