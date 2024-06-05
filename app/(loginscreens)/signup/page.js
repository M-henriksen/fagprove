"use client"
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation";

import Link from "next/link"
import { signUp } from '@/lib/auth'



export default function SignUp() {
    const { toast } = useToast()
    const router = useRouter()
    const [profilePicture, setProfilePicture] = useState(null)
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [formError, setFormError] = useState(false)


    const formValidation = () => {
        let status = true;
        const fields = [
            firstName,
            lastName,
            email,
            password
        ];
        fields.forEach(field => {
            if (field.length === 0) {
                status = false;
            }
        });
        if (!status) {
            toast({
                variant: "warning",
                title: "Uh oh! Husket å fylle inn alt?",
                description: "Mangler fornavn, etternavn, epost eller passord",
            });
            setFormError(true)
        }
        return status;
    };

    const handleSignUp = async () => {
        if (formValidation()) {
            try {
                const res = await signUp(firstName, lastName, email, password, profilePicture)
                if (res.status = "ok") {
                    router.push("/")
                }
            } catch (error) {
                console.log(error)
                toast({
                    variant: "destructive",
                    title: "Uh oh! Her skjedde det en feil",
                    description: "feil er",
                })
            }
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-10">
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Skriv in brukernavn og passord for å logge inn
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Profilbilde</Label>
                            <Input type="file" onChange={(e) => setProfilePicture(e.target.files[0])} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="first-name">Fornavn</Label>
                                <Input
                                    id="first-name"
                                    placeholder="Ola"
                                    required
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                                {formError ? <span className="text-xs text-gray-400">Fornavn mangler</span> : null}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="last-name">Etternavn</Label>
                                <Input
                                    id="last-name"
                                    placeholder="Normann"
                                    required
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                                {formError ? <span className="text-xs text-gray-400">Etternavn mangler</span> : null}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Epost</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="ola@nordmann.no"
                                required
                                onChange={(e) => { setEmail(e.target.value) }}
                            />
                            {formError ? <span className="text-xs text-gray-400">Epost mangler</span> : null}
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Passord</Label>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                onChange={(e) => { setPassword(e.target.value) }}
                            />
                            {formError ? <span className="text-xs text-gray-400">Passord mangler</span> : null}
                        </div>
                        <Button type="submit" onClick={handleSignUp}>Opprett bruker</Button>
                        <div className="mt-4 text-center text-sm gap-2">
                            <span>Har du allerede bruker? </span>
                            <Link href="/login">
                                Login her
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}

