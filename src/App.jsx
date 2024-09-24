import { useEffect } from "react";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import { useUiStore } from "./lib/uiStore";
const App = () => {

  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  console.log(chatId);
  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Fetch user info when user is authenticated
        fetchUserInfo(user.uid);
      } else {
        // Clear user state if no user is authenticated
        fetchUserInfo(null);
      }
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);
  const { chatorchatlist } = useUiStore();
  const mediaQuery = window.matchMedia("(max-width: 768px)");


  console.log(currentUser);
  if (isLoading) return <div className="loading">Loading...</div>
  return (
    <div className='container' style={{ backgroundColor: (chatorchatlist && mediaQuery.matches) ? 'none' : 'rgb(17,25,40,0.75)', backdropFilter: (chatorchatlist && mediaQuery.matches) ? 'none' : 'blur(19px) saturate(180%)' }}>
      {
        currentUser ? (
          <>
            <List />
            {chatId && <Chat />}
            {chatId && <Detail />}
          </>


        ) : (<Login />)
      }
      <Notification />
    </div>
  )
}

export default App
