"use client"
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"
import { signIn } from "@/lib/auth";

export default function Login() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState(false)
  const [resetEmail, setResetEmail] = useState("")


  //sjekker om bruker har skreve inn epost eller passord.
  //gir også feilmelding til bruker
  const formValidation = () => {
    let status = true;
    const fields = [
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
            description: "Mangler epost eller passord",
        });
        setFormError(true)
    }
    return status;
};

  const handleLogin = async () => {
    if (formValidation()) {
      try {
        const res = await signIn(email, password);
        console.log(res)
        if (res.status = "ok") {
          router.push("/")
        }

      } catch (error) {
        console.log(error)
        toast({
          variant: "destructive",
          title: "Uh oh! Her skjedde det en feil",
          description: error,
        })
        return (error)
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
                <Dialog>
                  <DialogTrigger asChild>
                    <span className="ml-auto inline-block text-sm underline">Glemt passord?</span>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Glemt passord?</DialogTitle>
                      <DialogDescription>
                        Skriv inn epost-addressen din så vil du få en mail.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reset-email" className="text-right">
                          Epost
                        </Label>
                        <Input
                          id="reset-email"
                          className="col-span-3"
                          required
                          onChange={(e) => setResetEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={resetPassword(resetEmail)}>Reset passord</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <Input
                id="password"
                type="password"
                required
                onChange={(e) => { setPassword(e.target.value) }}
              />
              {formError ? <span className="text-xs text-gray-400">Passord mangler</span> : null}
            </div>
            <Button type="submit" onClick={handleLogin}>Login</Button>
            <div className="mt-4 text-center text-sm gap-2">
              <span>Har du ikke bruker? </span>
              <Link href="/signup">
                Opprett bruker
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
