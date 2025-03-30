"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden p-0 w-10 h-10">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col gap-6 py-6">
          <Link to="#" className="text-lg font-medium hover:text-primary" onClick={() => setOpen(false)}>
            How It Works
          </Link>
          <Link to="#" className="text-lg font-medium hover:text-primary" onClick={() => setOpen(false)}>
            For Startups
          </Link>
          <Link to="#" className="text-lg font-medium hover:text-primary" onClick={() => setOpen(false)}>
            For Investors
          </Link>
          <Link to="#" className="text-lg font-medium hover:text-primary" onClick={() => setOpen(false)}>
            Success Stories
          </Link>
          <Link to="#" className="text-lg font-medium hover:text-primary" onClick={() => setOpen(false)}>
            Sign In
          </Link>
          <Button className="w-full" onClick={() => setOpen(false)}>
            Get Started
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

