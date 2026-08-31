"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2Icon, UserPlusIcon, SearchIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface RegistrationsClientProps {
  event: any;
  teams: any[];
  allUsers: any[];
}

export default function RegistrationsClient({ event, teams, allUsers }: RegistrationsClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Flatten teams into a list of members for easier searching, keeping team info
  const allRegistrations = teams.flatMap((team) =>
    team.members.map((member: any) => ({
      ...member,
      teamId: team.id,
      teamName: team.name,
      isLeader: team.leaderId === member.userId,
    }))
  );

  const filteredRegistrations = allRegistrations.filter((reg) =>
    reg.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemoveUser = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this user from the event?")) return;

    try {
      const res = await fetch(`/api/admin/events/${event.id}/registrations?userId=${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("User removed successfully");
        router.refresh();
      } else {
        const text = await res.text();
        toast.error(`Error: ${text}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const handleAddUser = async (userId: string) => {
    setIsAddingUser(true);
    try {
      const res = await fetch(`/api/admin/events/${event.id}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        toast.success("User added successfully");
        setIsDialogOpen(false);
        router.refresh();
      } else {
        const text = await res.text();
        toast.error(`Error: ${text}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setIsAddingUser(false);
    }
  };

  // Filter users not already registered
  const registeredUserIds = new Set(allRegistrations.map((r) => r.userId));
  const availableUsers = allUsers.filter(
    (u) => !registeredUserIds.has(u.id) && 
           (u.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
            u.email?.toLowerCase().includes(userSearchTerm.toLowerCase()))
  ).slice(0, 10); // show top 10 matches

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/admin/events"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Events</Link>
        </Button>
        <h1 className="text-3xl font-bold font-space-grotesk flex-1">
          {event.title} - Registrations
        </h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlusIcon className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User to Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2 border rounded-md p-2">
                {availableUsers.length === 0 ? (
                  <p className="text-sm text-center text-muted-foreground p-4">No users found</p>
                ) : (
                  availableUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                      <div>
                        <p className="font-medium text-sm">{u.displayName || u.name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleAddUser(u.id)}
                        disabled={isAddingUser}
                      >
                        Add
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Users ({allRegistrations.length})</CardTitle>
          <CardDescription>
            Manage users registered for this event. 
            {event.type === "TEAM" && " Note: Adding users manually currently creates them as a solo team."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 relative max-w-md">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search registrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-12 bg-muted/50 p-4 text-sm font-medium border-b">
              <div className="col-span-4">Name</div>
              <div className="col-span-4">Email</div>
              <div className="col-span-3">Team (Role)</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            {filteredRegistrations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No registrations found.
              </div>
            ) : (
              filteredRegistrations.map((reg) => (
                <div key={reg.id} className="grid grid-cols-12 p-4 items-center border-b last:border-0 hover:bg-muted/20">
                  <div className="col-span-4 font-medium truncate pr-4">
                    {reg.user.displayName || reg.user.name || "Unknown"}
                  </div>
                  <div className="col-span-4 text-sm text-muted-foreground truncate pr-4">
                    {reg.user.email}
                  </div>
                  <div className="col-span-3 text-sm truncate pr-4">
                    {event.type === "TEAM" ? reg.teamName : "Solo"} 
                    {event.type === "TEAM" && reg.isLeader && <span className="ml-2 text-xs bg-brand/20 text-brand-accent px-2 py-0.5 rounded">Leader</span>}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      onClick={() => handleRemoveUser(reg.userId)}
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
