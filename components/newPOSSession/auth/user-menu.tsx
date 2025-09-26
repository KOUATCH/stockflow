"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { logoutUser, switchOrganization } from "@/actions/auth/auth-actions"
import type { User } from "@/actions/auth/auth-actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserIcon, Settings, LogOut, Building, Shield, ChevronRight } from "lucide-react"

interface UserMenuProps {
  user: User
  currentOrganizationId?: string
}

export function UserMenu({ user, currentOrganizationId }: UserMenuProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await logoutUser()
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
      router.push("/login")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwitchOrganization = async (organizationId: string) => {
    if (organizationId === currentOrganizationId) return

    setIsLoading(true)
    try {
      const result = await switchOrganization(organizationId)
      if (result.success) {
        toast({
          title: "Organization switched",
          description: "Successfully switched organization context.",
        })
        router.refresh()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to switch organization",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to switch organization. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const currentOrganization = user.organizations.find((org) => org.organizationId === currentOrganizationId)

  const userInitials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={`${user.firstName} ${user.lastName}`} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs leading-none text-muted-foreground mt-1">{user.email}</p>
              </div>
            </div>

            {currentOrganization && (
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs font-medium">{currentOrganization.organization.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {currentOrganization.role.name}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer">
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        {user.organizations.length > 1 && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <Building className="mr-2 h-4 w-4" />
              <span>Switch Organization</span>
              <ChevronRight className="ml-auto h-4 w-4" />
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-64">
              {user.organizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  className="cursor-pointer"
                  onClick={() => handleSwitchOrganization(org.organizationId)}
                  disabled={org.organizationId === currentOrganizationId || isLoading}
                >
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <p className="text-sm font-medium">{org.organization.name}</p>
                      <p className="text-xs text-muted-foreground">{org.role.name}</p>
                    </div>
                    {org.organizationId === currentOrganizationId && (
                      <Badge variant="default" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleLogout}
          disabled={isLoading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? "Logging out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
