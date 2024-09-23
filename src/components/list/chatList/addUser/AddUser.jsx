import React, { useState } from 'react'
import "./addUser.css"
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { db } from '../../../../lib/firebase'
import { useUserStore } from '../../../../lib/userStore'
import { toast } from 'react-toastify'
const AddUser = () => {
    const [user, setUser] = useState(null);
    const { currentUser } = useUserStore();
    const handleSearch = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get("username");

        if (currentUser.username === username) {
            setUser(null);
            console.log("You cannot add yourself.");
            return;
        }

        try {
            const userRef = collection(db, "users");
            const q = query(userRef, where("username", "==", username));
            const querySnapShot = await getDocs(q);

            if (!querySnapShot.empty) {
                const searchedUser = querySnapShot.docs[0].data();

                // Check if the user is already in the currentUser's chats
                const userChatsRef = doc(db, "userchats", currentUser.id);
                const userChatSnapshot = await getDoc(userChatsRef);

                if (userChatSnapshot.exists()) {
                    const chats = userChatSnapshot.data().chats || [];
                    const isUserAlreadyAdded = chats.some(chat => chat.receiverId === searchedUser.id);

                    if (isUserAlreadyAdded) {
                        setUser(null);
                        console.log("User is already added to your chats.");
                        toast.warn("User is already added to your chats.");
                        return;
                    }
                }

                // If user is not already added, update the state
                setUser(searchedUser);
            } else {
                setUser(null);
                console.log("User not found.");
                toast.warn("User not found.");
            }
        } catch (error) {
            console.log("Error during user search:", error);
            toast.error("Error during user search:", error.message);

        }
    };

    const handleAdd = async () => {
        const userChatsRef1 = doc(db, "userchats", currentUser.id);
        const userChatSnapshot = await getDoc(userChatsRef1);

        if (userChatSnapshot.exists()) {
            const chats = userChatSnapshot.data().chats || [];

            // Check if the chat with the specific receiverId already exists
            const chatExists = chats.some(chat => chat.receiverId === user.id);

            if (chatExists) {
                console.log("Chat with this user already exists. Not adding again.");
                return; // Stop execution if chat already exists
            }
        }
        const chatRef = collection(db, "chats");
        const userChatsRef = collection(db, "userchats");
        try {
            const newChatRef = doc(chatRef);
            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: [],
            });

            await updateDoc(doc(userChatsRef, user.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: currentUser.id,
                    updatedAt: Date.now(),
                })
            })

            await updateDoc(doc(userChatsRef, currentUser.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: user.id,
                    updatedAt: Date.now(),
                })
            })
        } catch (error) {
            console.log(error);
            toast.error(error);
        }
        toast.success('Successfully Added!');
    }
    return (
        <div className='addUser'>
            <form onSubmit={handleSearch}>
                <input type="text" placeholder='Username' name="username" />
                <button>Search</button>
            </form>
            {user && <div className="user">
                <div className="detail">
                    <img src={user.avatar || "./avatar.png"} alt="" />
                    <span>{user.username}</span>
                </div>
                <button onClick={handleAdd}>Add User</button>

            </div>}

        </div>
    )
}

export default AddUser
