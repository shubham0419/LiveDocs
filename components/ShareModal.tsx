import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from './ui/button';
import Image from 'next/image';
import { Label } from '@radix-ui/react-label';
import { Input } from './ui/input';
import UserTypeSelector from './UserTypeSelector';
import { useSelf } from '@liveblocks/react/suspense';
import Collaborator from './Collaborator';
import { updateDocumentAccess } from '@/lib/actions/room.actions';


const ShareModal = ({roomId,collaborators,creatorId,currentUserType}:ShareDocumentDialogProps) => {
  const  user = useSelf()
  const [open,setOpen] = useState(false);
  const [loading,setLoading] = useState(false);
  const [email,setEmail] = useState("");
  const [userType,setUserType] = useState<UserType>('viewer');

  const shareDocument = async ()=>{
    setLoading(true);
    try {
      await updateDocumentAccess({
        roomId,
        email,
        userType:userType as UserType,
        updatedBy:user.info
      });
    } catch (error) {
      console.log(error);
    } 
    setLoading(false);
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger>
    <Button className='gradient-blue flex h-9 gap-1 px-4' disabled={currentUserType!=='editor'}>
      <Image src={"/assets/icons/share.svg"} alt='share' width={20} height={20}
      className='min-w-4 md:size-5'/> 
      <p className='mr-1 hidden sm:block'>Share</p>
    </Button>
  </DialogTrigger>
  <DialogContent className='shad-dialog'>
    <DialogHeader>
      <DialogTitle>Manage who can edit this project</DialogTitle>
      <DialogDescription>
        Select which users can edit this document
      </DialogDescription>
    </DialogHeader>
    <Label htmlFor='email' className='mt-6 text-blue-100'>
      Email address
    </Label>
    <div className='flex items-center gap-3'>
    <div className='flex flex-1 rounded-md bg-dark-400'>
      <Input id='email' placeholder='Enter email' onChange={(e)=>setEmail(e.target.value)} className='share-input'/>
      <UserTypeSelector userType={userType} setUserType={setUserType}/>
    </div>
    <Button type='submit' onClick={shareDocument}
      className='gradient-blue flex h-full gap-1 px-5' disabled={loading}>
      {loading?"Loading...":"Invite"}
    </Button>
    </div>
    <div className='my-2 space-y-2'>
      <ul className='flex flex-col'>
        {collaborators.map(collaborator=>(
          <Collaborator 
            key={collaborator.id}
            roomId={roomId}
            creatorId={creatorId}
            email={email}
            collaborator={collaborator}
            user={user.info}
          />
        ))}
      </ul>
    </div>
  </DialogContent>
</Dialog>

  )
}

export default ShareModal