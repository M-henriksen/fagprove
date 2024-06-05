import Link from "next/link"
import Image from "next/image"
import { Grid3x3Icon, UsersIcon, CalendarIcon, UserIcon } from "lucide-react"
import { Label } from "../ui/label"
import Logo from "../../public/logo-main.svg"

import React from 'react'

const Nav = () => {
    return (
        <div className="flex flex-4 p-2 bg-[#FAFBFB] flex-col justify-between align-middle items-center">
            <nav className="grid items-start text-sm font-medium pt-2 gap-1">
                <Image src={Logo} width={150} height={"auto"} alt="logo" className="mb-3" />
                <Link
                    href="/"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                    <Grid3x3Icon className="h-4 w-4" />
                    Hjem
                </Link>
                <Link
                    href="/groups"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                    <UsersIcon className="h-4 w-4" />
                    Grupper
                </Link>
                <Link
                    href="/events"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                    <UserIcon className="h-4 w-4" />
                    Event
                </Link>
            </nav>

            {/** 
            <div>
                <Link
                    href="#"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                    <UserIcon className="h-4 w-4" />
                    Instillinger
                </Link>
            </div>
            */}
        </div>
    )
}

export default Nav
