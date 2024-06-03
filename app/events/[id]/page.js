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

export default function Events({ params }) {
    //params.id
    return (
        <div className='flex flex-col p-10 gap-5'>
            <div className='relative w-full h-[300px]'>
                <img src="https://miro.medium.com/v2/resize:fit:1400/1*ydhn1QPAKsrbt6UWfn3YnA.jpeg" alt="img" className='w-full h-full object-cover' />
            </div>
            <div className='flex flex-col gap-4'>
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-2'>
                        <Label className="text-xl font-bold">dato og tid</Label>
                        <span>29.05.2023 at 15:30</span>
                    </div>

                    <div className='flex flex-col gap-2'>
                        <Label className="text-xl font-bold">Lokasjon</Label>
                        <span>Bergen works</span>
                    </div>

                    <div className='flex flex-col gap-2 text-center'>
                        <Label className="text-xl font-bold">Attendance</Label>
                        <div className='flex gap-3'>
                            <Button variant="outline">Yes</Button>
                            <Button variant="outline">No</Button>
                            <Button variant="outline">Maybe</Button>
                        </div>
                    </div>
                </div>

                <div>
                    <Label className="text-xl font-bold">Event beskrivelse</Label>
                    <p>
                        Join us for our annual charity gala, where we'll be raising funds for the local community.
                        This year's event will feature a silent auction, live music, and a delicious dinner.
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
                            <p>I'm so excited for this event! Can't wait to see everyone there. </p>
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

