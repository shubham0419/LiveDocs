"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { parseStringify } from "../utils";
import { liveblocks } from "../liveblocks";

export const getClerkUsers = async ({ userIds }: { userIds: string[] }) => {
  try {
    const { data } = await clerkClient.users.getUserList({
      emailAddress: userIds,
    });

    const users = data.map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.emailAddresses[0].emailAddress,
      avatar:user.imageUrl
    }));
    const sortedUsers = userIds.map((email)=>users.find((user)=>user.email===email));
    return parseStringify(sortedUsers);
  } catch (error) {
    console.log(error);
  }
};

export const getDocumentUsers = async ({roomId,currentUser,text}:{roomId:string,currentUser:string,text:string})=>{
  try {
    const room = await liveblocks.getRoom(roomId);

    const allUsers = Object.keys(room.usersAccesses).filter((email)=>email!==currentUser);

    if(text.length){
      const searchText = text.toLowerCase();
      const users = allUsers.filter((email:string)=>email.toLowerCase().includes(searchText))

      return parseStringify(users);
    }
  } catch (error) {
    console.log('error while fetching doccument users',error);
  }
}