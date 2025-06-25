"use client"

import { cn } from "../../lib/utils"
import { CircleNotch } from "@phosphor-icons/react"
import React from "react"

export const Spinner = ({ className }: { className?: string }) => {
    return <CircleNotch className={cn("animate-spin text-muted-foreground", className)} />
} 