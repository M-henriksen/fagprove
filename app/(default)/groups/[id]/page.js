"use client"
import React, { useEffect, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
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
import { useToast } from "@/components/ui/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
    SelectLabel,
} from "@/components/ui/select"
import { addMember } from '@/lib/group'
import { Label } from "@/components/ui/label"
import { onSnapshot, doc, collection, getDocs, query, where } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { db } from '@/lib/firebase'
import dayjs from 'dayjs'
import { addPost, updateGroupInfo } from '@/lib/group'
import { useRouter } from 'next/navigation'
import { createNewEvent } from '@/lib/events'

// om det hadde vært bedre tid ville jeg prøvd å minimere antall useStates, ser det fort blir litt mange.
// Ville heller hatt en for kvar funksjon som skal skrive til db og hente ut verdiene derfra
// fikk ikkje tida på alle men fikk gjort det på en

export default function Groups({ params }) {
    const { toast } = useToast()
    const router = useRouter()
    const docID = params.id
    const [group, setGroup] = useState({ title: "", description: "", imgUrl: "", newImg: null, oldTitle: "", memberInfo: [] })
    const [posts, setPosts] = useState([])
    const [content, setContent] = useState("")
    const [users, setUsers] = useState([])
    const [member, setMember] = useState({})
    const [user, setUser] = useState({})
    const [postImage, setPostImage] = useState(null)
    const [events, setEvents] = useState([])
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [date, setDate] = useState()
    const [image, setImage] = useState(null)
    const [location, setLocation] = useState("")



    const docRef = doc(db, "groups", docID)
    const postsCollectionRef = collection(db, "groups", docID, "posts")


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
                setGroup({
                    title: docSnapshot.data().title,
                    description: docSnapshot.data().description,
                    imgUrl: docSnapshot.data().imgUrl,
                    oldTitle: docSnapshot.data().title,
                    memberInfo: docSnapshot.data().memberInfo,
                });

            }
        });


        const unsubPosts = onSnapshot(postsCollectionRef, (snapshot) => {
            const data = snapshot.docs.map((doc) => {
                return { id: doc.id, ...doc.data() };
            });
            setPosts(data);
        });


        {/**  Henter eventer som har groupId som samme som gruppe dokument id. dette for å hente eventer med gruppe tilhørlighet */ }
        const evnetsCollectionRef = collection(db, "events")
        const q = query(evnetsCollectionRef, where("groupId", "==", docID))
        const unsubEvents = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => {
                let date = dayjs(doc.data.date).format("DD.MM.YYYY HH:mm")
                return { id: doc.id, ...doc.data(), date };
            });
            setEvents(data);
        })
        return () => {
            unsubUser();
            unsubGroup();
            unsubPosts();
            unsubEvents();
        };
    }, []);


    const handleAddPost = async () => {
        try {
            const res = addPost(docID, content, postImage)
            console.log(res)
            return res
        } catch (error) {
            console.log(error)
            return error
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

    const handleAddingMember = async () => {
        try {
            const res = await addMember(docID, member)
            console.log(res)
            toast({
                title: "Medlem lagt til",
                description: `${member.firstName} ble lagt til i gruppen`,
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

    const handleCreateNewEvent = async () => {
        try {
            const res = await createNewEvent(title, description, location, date, image, user.uid, docID)
            console.log(res)

        } catch (error) {
            console.log(error)
        }
    }

    const handleRedirect = (id) => {
        router.push(`/events/${id}`)
    }

    const handleEditCardInfo = (e, key) => {
        const value = key === "newImg" ? e.target.files[0] : e.target.value;
        setGroup({ ...group, [key]: value });
    };

    const handleEditCard = async () => {
        try {
            const res = await updateGroupInfo(group, docID)
            console.log(res)

        } catch (error) {
            console.log(error)
        }

    }

    console.log(group)

    return (
        <div className="flex min-h-screen w-full flex-col">
            <div className="my-5 grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
                <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                        <Card className="flex sm:col-span-2 justify-between">
                            <CardContent className="flex flex-row">
                                {
                                    group.imgUrl
                                        ? <img src={group.imgUrl} className='w-20 h-20 object-cover mt-5 ml-5 rounded-md' />
                                        : null
                                }
                                <CardHeader className="pb-3">
                                    <CardTitle>{group.title}</CardTitle>
                                    <CardDescription className="text-balance leading-relaxed">
                                        {group.description}
                                    </CardDescription>
                                </CardHeader>
                            </CardContent>
                            <CardFooter className="flex flex-col justify-end">
                                <Dialog>
                                    <DialogTrigger>
                                        Rediger
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Rediger gruppe</DialogTitle>
                                            <DialogDescription>
                                                Endre navn og beskrivelse
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="name" className="text-right">
                                                    Gruppenavn
                                                </Label>
                                                <Input
                                                    id="name"
                                                    defaultValue={group.title}
                                                    className="col-span-3"
                                                    onChange={(e) => handleEditCardInfo(e, "title")}
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="username" className="text-right">
                                                    Beskrivelse
                                                </Label>
                                                <Textarea placeholder="Type your message here."
                                                    defaultValue={group.description}
                                                    className="col-span-3"
                                                    onChange={(e) => handleEditCardInfo(e, "description")}
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="username" className="text-right">
                                                    Gruppe bilde
                                                </Label>
                                                <Input
                                                    id="name"
                                                    type="file"
                                                    className="col-span-3"
                                                    onChange={(e) => handleEditCardInfo(e, "newImg")}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" onClick={handleEditCard}>Lagre endringer</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardFooter>
                        </Card>
                    </div>

                    <div>
                        <Dialog>
                            <DialogTrigger>
                                Opprett innlegg
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Opprett innlegg</DialogTitle>
                                    <DialogDescription>
                                        Her kan du opprette innlegg
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="username" className="text-right">
                                            content
                                        </Label>
                                        <Textarea placeholder="Hva ønsker du å fortelle gruppen"
                                            defaultValue={content}
                                            className="col-span-3"
                                            onChange={(e) => { setContent(e.target.value) }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="username" className="text-right">
                                            Bilde
                                        </Label>
                                        <Input
                                            id="name"
                                            type="file"
                                            className="col-span-3"
                                            onChange={(e) => setPostImage(e.target.files[0])}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleAddPost}>Opprett innlegg</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog>
                            <DialogTrigger className='ml-5'>Lag nytt arrangement</DialogTrigger>
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
                                        <Input placeholder="Måløy" onChange={(e) => setLocation(e.target.value)} />
                                    </div>
                                </div>
                                <DialogFooter className="w-full mt-5">
                                    <Button type="submit" className="w-full" onClick={handleCreateNewEvent}>Opprett event</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Label className=" text-3xl font-semibold">Poster:</Label>

                    {posts.map((item, index) => (
                        <div key={item.id}>
                            <Card>
                                <CardHeader className="px-7">
                                    <CardTitle>{item.name}</CardTitle>
                                    <CardDescription>
                                        {item.date}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-2">
                                    {
                                        item.imgUrl
                                            ? <img src={item.imgUrl} alt="bilde mangler" className=' w-80 h-auto object-cover rounded-md' />

                                            : null
                                    }
                                    {item.content}
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
                <div className='flex flex-col gap-3'>
                    <Card className="overflow-hidden">
                        <CardHeader className="px-7">
                            <CardTitle>Medlemmer</CardTitle>
                            <CardDescription>
                                Liste over medlemmer
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2 my-2 ">
                            {group.memberInfo.slice(0, 5).map((member, index) => (
                                <span
                                    key={index}>{member.fullName}
                                </span>
                            ))}
                            <Dialog>
                                <DialogTrigger className='flex mt-2'>
                                    Se alle medlemmer
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Oversikt</DialogTitle>
                                        <DialogDescription>
                                            Her kan du se alle medlemmer
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className='flex flex-col gap-2'>
                                        {group.memberInfo.map((member, index) => (
                                            <span
                                                key={index}>{member.fullName}
                                            </span>
                                        ))}
                                    </div>
                                </DialogContent>
                            </Dialog>

                        </CardContent>

                        <CardFooter className="flex justify-end">
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
                        </CardFooter>
                    </Card>
                    <Label className=" text-3xl font-semibold">Events:</Label>
                    {events.map((event) => (
                        <Card className="overflow-hidden" key={event.id}>
                            <CardHeader className="px-7 ">
                                <div className='flex flex-row gap-2'>
                                    <img src={event.imgUrl} alt="event bilde" className='w-28 h-32 object-cover' />
                                    <CardTitle>{event.title}</CardTitle>
                                </div>
                                <CardDescription className="flex flex-col gap-2">
                                    <div className='flex flex-row gap-1'>
                                        <span>Dato tid :</span>
                                        <span>{event.date}</span>
                                    </div>
                                    <div className='flex flex-row gap-1'>
                                        <span>Sted :</span>
                                        <span>{event.location}</span>
                                    </div>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2 my-2 ">
                                {event.description}
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Button variant="ghost" onClick={() => handleRedirect(event.id)}>Se mer</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}

