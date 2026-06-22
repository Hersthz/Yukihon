import React, { useEffect, useState } from "react";
import { MessageSquare, UserPlus, Users, Check, X, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  friendApi,
  privateChatApi,
  type UserConnection,
  type ConnectionStatus,
  type PrivateMessage,
} from "@/api";
import { usePrivateChat } from "@/hooks/community/usePrivateChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const FriendAndPmMessenger = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState<UserConnection[]>([]);
  const [pending, setPending] = useState<UserConnection[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const [selectedFriendName, setSelectedFriendName] = useState("");
  const [findUserId, setFindUserId] = useState("");

  const loadFriends = async () => {
    try {
      setFriends(await friendApi.getFriends());
      setPending(await friendApi.getPendingRequests());
    } catch (e) {}
  };

  useEffect(() => {
    if (open && user) {
      loadFriends();
    }
  }, [open, user]);

  const handleSendRequest = async () => {
    if (!findUserId) return;
    try {
      await friendApi.sendRequest(Number(findUserId));
      setFindUserId("");
      alert("Friend request sent!");
    } catch (e: any) {
      alert(e.message || "Failed to send request");
    }
  };

  const handleAccept = async (id: number) => {
    try {
      await friendApi.acceptRequest(id);
      loadFriends();
    } catch (e) {}
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg" size="icon">
          <MessageSquare className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Friends & Messages</DialogTitle>
          <DialogDescription className="sr-only">
            Messaging and friends management
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="friends" className="flex-1 flex flex-col">
          <div className="px-4 pt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="friends">
                <Users className="w-4 h-4 mr-2" /> Friends
              </TabsTrigger>
              <TabsTrigger value="chat" disabled={!selectedFriendId}>
                <MessageSquare className="w-4 h-4 mr-2" /> Chat
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="friends" className="flex-1 flex flex-col m-0 overflow-hidden">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">Add Friend</h4>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter User ID..."
                      value={findUserId}
                      onChange={(e) => setFindUserId(e.target.value)}
                      type="number"
                    />
                    <Button size="icon" onClick={handleSendRequest}>
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {pending.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">
                      Pending Requests ({pending.length})
                    </h4>
                    <div className="space-y-2">
                      {pending.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded-lg border bg-card"
                        >
                          <span className="text-sm font-medium">{p.requester.displayName}</span>
                          <Button size="sm" onClick={() => handleAccept(p.id)}>
                            Accept
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-sm mb-2">My Friends ({friends.length})</h4>
                  <div className="space-y-2">
                    {friends.length === 0 && (
                      <p className="text-xs text-muted-foreground">No friends yet.</p>
                    )}
                    {friends.map((f) => {
                      const friendUser = f.requester.id === user?.id ? f.receiver : f.requester;
                      return (
                        <div
                          key={f.id}
                          className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedFriendId(friendUser.id);
                            setSelectedFriendName(friendUser.displayName);
                            const el = document.querySelector('[data-value="chat"]') as HTMLElement;
                            if (el) el.click();
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{friendUser.displayName[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{friendUser.displayName}</span>
                          </div>
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent
            value="chat"
            className="flex-1 flex flex-col m-0 p-0 overflow-hidden outline-none"
          >
            {selectedFriendId ? (
              <PrivateChatView
                currentUserId={user?.id}
                otherUserId={selectedFriendId}
                otherUserName={selectedFriendName}
              />
            ) : (
              <div className="flex p-4 flex-col items-center justify-center h-full text-muted-foreground text-sm">
                Select a friend to start chatting
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

const PrivateChatView = ({
  currentUserId,
  otherUserId,
  otherUserName,
}: {
  currentUserId?: number;
  otherUserId: number;
  otherUserName: string;
}) => {
  const [inputText, setInputText] = useState("");
  const { messages, sendMessage, otherUserTyping, sendTyping, connectionState } = usePrivateChat({
    currentUserId,
    otherUserId,
    enabled: true,
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText("");
    sendTyping(false);
  };

  const handleType = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    sendTyping(e.target.value.length > 0);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-3 border-b bg-muted/20 flex items-center justify-between">
        <span className="font-semibold text-sm">{otherUserName}</span>
        <span
          className={`w-2 h-2 rounded-full ${connectionState === "connected" ? "bg-green-500" : "bg-red-500"}`}
        />
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col justify-end space-y-3 min-h-full">
          {messages.map((m) => {
            const isMe = m.sender.id === currentUserId;
            return (
              <div key={m.id} className={`flex max-w-[80%] ${isMe ? "self-end" : "self-start"}`}>
                <div
                  className={`rounded-xl px-3 py-2 text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}
          {otherUserTyping && (
            <div className="text-xs text-muted-foreground animate-pulse">
              {otherUserName} is typing...
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t bg-card">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={inputText}
            onChange={handleType}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!inputText.trim() || connectionState !== "connected"}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};
