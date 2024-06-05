"use client"
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { onAuthStateChanged } from 'firebase/auth'
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, limit, onSnapshot, query, } from "firebase/firestore";
import { UsersIcon, ChevronRight } from "lucide-react"
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase";


export default function Home() {
  const router = useRouter()
  const [groups, setGroups] = useState([])
  const [events, setEvents] = useState([])

  const handleRedirect = (url) => {
    router.push(url)
  }

  const groupCollectionRef = collection(db, "groups")
  const eventsCollectionRef = collection(db, "events")
  useEffect(() => {

    const unsubUser = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {

      } else {
        router.push("/login")
      }
    });
    const groupQ = query(groupCollectionRef, limit(5))
    const unsubscribeGroup = onSnapshot(groupQ, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });
      setGroups(data);
    });
    const eventsQ = query(eventsCollectionRef, limit(5))
    const unsubscribeEvents = onSnapshot(eventsQ, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });
      setEvents(data);
    });
    return () => {
      unsubUser()
      unsubscribeGroup();
      unsubscribeEvents();
    };
  }, []);
  console.log(groups)

  return (
    <main className="flex-1 min-h-screen">
      <div className="grid grid-cols-4 gap-2 p-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Mine grupper</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 justify-center items-center">
            {groups.map((group) => (
              <div className="flex w-full items-center gap-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800" key={group.id}>
                <div className="bg-gray-200 rounded-md flex items-center justify-center aspect-square w-12 dark:bg-gray-700">
                  <UsersIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="grid gap-1 flex-1">
                  <div className="font-medium">{group.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {group.description}
                  </div>
                  <div className="flex flex-col gap-2 mt-2 text-sm font-medium">
                    <Label>Medlemmer :</Label>
                    {group.memberInfo.slice(0, 5).map((member) => (
                      <span className="text-gray-500 dark:text-gray-400" key={member.uid}>
                        {member.fullName}
                      </span>
                    ))}
                  </div>
                </div>
                <Button size="icon" variant="ghost">
                  <ChevronRight />
                  <span className="sr-only">Se gruppe</span>
                </Button>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => handleRedirect("/groups")}>Se mer</Button>
          </CardFooter>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Mine eventer</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 justify-center items-center">
            {events.map((events) => (
              <div className="flex w-full items-center gap-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800" key={events.id}>
                <div className="bg-gray-200 rounded-md flex items-center justify-center aspect-square w-12 dark:bg-gray-700">
                  <UsersIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="grid gap-1 flex-1">
                  <div className="font-medium">{events.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {events.description}
                  </div>
                </div>
                <Button size="icon" variant="ghost">
                  <ChevronRight />
                  <span className="sr-only">Se gruppe</span>
                </Button>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => handleRedirect("/events")}>Se mer</Button>
          </CardFooter>
        </Card>
      </div>


    </main>
  );
}
