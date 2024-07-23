"use server";
import { nanoid } from "nanoid";
import { liveblocks } from "../liveblocks";
import { revalidatePath } from "next/cache";
import { getAccessType, parseStringify } from "../utils";
import { AwardIcon } from "lucide-react";
import { redirect } from "next/navigation";

export const createDocument = async ({
  userId,
  email,
}: CreateDocumentParams) => {
  const roomId = nanoid();

  try {
    const metadata = {
      creatorId: userId,
      email,
      title: "Untitled",
    };

    const usersAccesses: RoomAccesses = {
      [email]: ["room:write"],
    };

    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses,
      defaultAccesses: [],
    });
    revalidatePath("/");
    return parseStringify(room);
  } catch (error) {
    console.log("error occurs during creation of room", error);
  }
};

export const getDocument = async ({
  roomId,
  userId,
}: {
  userId: string;
  roomId: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);
    const hasAccess = Object.keys(room.usersAccesses).includes(userId);
    if (!hasAccess) {
      throw new Error("You don't have access to this document");
    }
    return parseStringify(room);
  } catch (error) {
    console.log("error ehile geeting document", error);
  }
};


export const updateDocument = async(roomId:string,title:string)=>{
  try {
    const updateRoom = await liveblocks.updateRoom(roomId,{
      metadata: {
        title
      }
    })

    revalidatePath(`/documents/${roomId}`);
    return parseStringify(updateRoom);
  } catch (error) {
    console.log('error occured while updatind Document');
  }
}

export const getDocuments = async (email:string) => {
  try {
    const rooms = await liveblocks.getRooms({userId:email});
    
    return parseStringify(rooms);
  } catch (error) {
    console.log("error ehile geting documents", error);
  }
};

export const updateDocumentAccess = async({roomId,email,userType,updatedBy}:ShareDocumentParams) =>{
  try {
    const usersAccesses:RoomAccesses = {
      [email]: getAccessType(userType) as AccessType
    }
    const room = await liveblocks.updateRoom(roomId,{usersAccesses});
    if(room) {
      const notiId = nanoid();

      await liveblocks.triggerInboxNotification({
        userId:email,
        kind:'$documentAccess',
        subjectId:notiId,
        activityData:{
          userType,
          title:`You have been granted ${userType} access to the document by ${updatedBy.name}`,
          updatedBy:updatedBy.name,
          avatar:updatedBy.avatar,
          email:updatedBy.email
        },
        roomId
      })
    }
    revalidatePath(`/documents/${roomId}`);
    return parseStringify(room);
  } catch (error) {
    console.log("---",email);
    // console.log('error happend while updating access',error);
  }
}

export const removeCollaborator = async({roomId,email}:{roomId:string,email:string})=>{
  try {
    const room = await liveblocks.getRoom(roomId);

    if(room.metadata.email===email) {
      throw new Error('You cannot remove yourself from the room')
    }
    const updateRoom = await liveblocks.updateRoom(roomId,{
      usersAccesses:{
        [email]: null
      }
    })
  } catch (error) {
    console.log('error occured while removing collaborator');
  }
}

export const deleteDocument = async (roomId:string)=>{
  try {
    await liveblocks.deleteRoom(roomId);
    revalidatePath("/");
  } catch (error) {
    console.log("error occured while deleting the document",error);
  }
}