"use client"

import { ClientSideSuspense, RoomProvider } from "@liveblocks/react/suspense"
import Header from "./Header"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { Editor } from "./editor/Editor"
import ActiveCollaborators from "./ActiveCollaborators"
import { useEffect, useRef, useState } from "react"
import { Input } from "./ui/input"
import Image from "next/image"
import { updateDocument } from "@/lib/actions/room.actions"
import Loader from "./Loader"
import ShareModal from "./ShareModal"

const CollaborativeRoom = ({ roomId, roomMetadata, users,currentUserType }: CollaborativeRoomProps) => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [documentHeading, setDocumentHeading] = useState(roomMetadata.title);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateTitleHandler = async (e:React.KeyboardEvent<HTMLInputElement>)=>{
    if(e.key === "Enter"){
      setLoading(true);

      try {
        if(documentHeading !== roomMetadata.title){
          const updatedDoc = await updateDocument(roomId,documentHeading);

          if(updatedDoc) setEditing(false);
        }
      } catch (error) {
        console.log('error while updating dom',error);
      }
      setLoading(false);
    }
  }

  useEffect(()=>{
    const handleMousedown = (e:MouseEvent)=>{
      if(containerRef.current && !containerRef.current?.contains(e.target as Node)){
        setEditing(false);
        updateDocument(roomId,documentHeading)
      }
    }
    document.addEventListener("mousedown",handleMousedown);

    return ()=>{
      document.removeEventListener("mousedown",handleMousedown);
    }
  },[documentHeading,roomId])

  useEffect(()=>{
    if(editing && inputRef.current) {
      inputRef.current.focus();
    }
  },[editing])
  return (
    <RoomProvider id={roomId}>
      <ClientSideSuspense fallback={<Loader/>}>
        <div className="collaborative-room">
          <Header>
            <div ref={containerRef} className='flex w-fit items-center justify-center gap-2'>
              {editing && !loading ? (
                <Input type="text" 
                  value={documentHeading}
                  ref={inputRef}
                  placeholder="Enter title"
                  onChange={(e) => setDocumentHeading(e.target.value)}
                  onKeyDown={updateTitleHandler}
                  disabled={!editing}
                  className="document-title-input"
                  />
              ) : (<>
                <p className="document-title">{documentHeading}</p></>
              )}
              {currentUserType==="editor" && !editing &&(
              <Image src={"/assets/icons/edit.svg"} alt="Edit" width={24} height={24}
                className="pointer" onClick={() => setEditing(true)}/>)}

              {currentUserType !=="editor" && !editing &&(
                <p className="view-only-tag">View only</p>
              )}

              {loading && <p className="text-sm text-gray-400">saving...</p>}
            </div>
            <div className="flex w-full flex-1 justify-end gap-2 sm:gap-3">
              <ActiveCollaborators />
              <ShareModal 
                roomId={roomId}
                collaborators={users}
                creatorId={roomMetadata.creatorId}
                currentUserType={currentUserType}/>
            </div>
            <div>
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </Header>
          <Editor roomId={roomId} currentUserType={currentUserType}/>
        </div>
      </ClientSideSuspense>
    </RoomProvider>
  )
}

export default CollaborativeRoom