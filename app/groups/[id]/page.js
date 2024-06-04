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
import { onSnapshot, doc, collection, getDocs } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { db } from '@/lib/firebase'
import dayjs from 'dayjs'
import { addPost } from '@/lib/group'
import { useRouter } from 'next/navigation'

export default function Groups({ params }) {
    const { toast } = useToast()
    const router = useRouter()
    const docID = params.id
    const [data, setData] = useState([])
    const [posts, setPosts] = useState([])
    const [content, setContent] = useState("")
    const [users, setUsers] = useState([])
    const [member, setMember] = useState({})
    const [postImage, setPostImage] = useState(null)
    const docRef = doc(db, "groups", docID)
    const postsCollectionRef = collection(db, "groups", docID, "posts")


    console.log(docRef);
    useEffect(() => {

        const unsubUser = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                // setUser(currentUser)
            } else {
                router.push("/login")
            }
        });


        const unsubGroup = onSnapshot(docRef, (docSnapshot) => {
            console.log(docSnapshot);
            if (docSnapshot.exists()) {
                setData(docSnapshot.data());
            }
        });

        //q parameter og sort på tid
        const unsubPosts = onSnapshot(postsCollectionRef, (snapshot) => {
            const data = snapshot.docs.map((doc) => {
                return { id: doc.id, ...doc.data() };
            });
            setPosts(data);
        });

        return () => {
            unsubUser()
            unsubGroup();
            unsubPosts()
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
    console.log("medlem valgt", member)

    const handleAddingMember = async () => {

        console.log("kjørte")
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


    return (
        <div className="flex min-h-screen w-full flex-col">
            <div className="my-5 grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
                <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                        <Card className="flex sm:col-span-2">
                            {
                                data.imgUrl
                                    ? <img src={data.imgUrl} className='w-20 h-20 object-cover mt-5 ml-5' />
                                    : null
                            }
                            <CardHeader className="pb-3">
                                <CardTitle>Gruppe navn</CardTitle>
                                <CardDescription className="max-w-lg text-balance leading-relaxed">
                                    SK brann sin offesielle gruppe
                                    orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
                                </CardDescription>
                            </CardHeader>
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
                                                    defaultValue="Orginal navn"
                                                    className="col-span-3"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="username" className="text-right">
                                                    Username
                                                </Label>
                                                <Textarea placeholder="Type your message here."
                                                    defaultValue="Orginal Beskrivelse"
                                                    className="col-span-3" />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="username" className="text-right">
                                                    Gruppe bilde
                                                </Label>
                                                <Input
                                                    id="name"
                                                    type="file"
                                                    className="col-span-3"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit">Lagre endringer</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardFooter>
                        </Card>
                    </div>
                    <Dialog>
                        <DialogTrigger className='flex'>
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
                    {posts.map((item, index) => (
                        <div key={item.id}>
                            <Card>
                                <CardHeader className="px-7">
                                    <CardTitle>{item.name}</CardTitle>
                                    <CardDescription>
                                        {item.date}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex">
                                    {item.content}
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
                <div>
                    <Card className="overflow-hidden">
                        <CardHeader className="px-7">
                            <CardTitle>Medlemmer</CardTitle>
                            <CardDescription>
                                Liste over medlemmer
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2 my-2 ">
                            <span>Name</span>
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
                    <Card className="overflow-hidden flex items-center align-middle">
                        <div className='ml-5'>
                            <img src="https://tmssl.akamaized.net/images/foto/stadionnormal/stadion-sk-brann-bergen-2019-1629543633-69395.jpg?lm=1629543655" alt="event bilde" className='w-28 h-32 object-cover' />
                        </div>
                        <div>
                            <CardHeader>
                                <CardTitle>Events</CardTitle>
                                <CardDescription>
                                    Dato og tid
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                Join us for a fun group meetup at the local cafe.
                            </CardContent>
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    )
}

