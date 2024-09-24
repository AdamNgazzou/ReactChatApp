
import React, { useEffect, useState } from 'react';
import './Detail.css';
import { auth, db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import { arrayRemove, arrayUnion, doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { useDetailUiStore } from '../../lib/detailui';

const Detail = () => {
    const { chatId, user } = useChatStore();
    const { currentUser } = useUserStore();
    const [isUserBlockingMe, setIsUserBlockingMe] = useState(false);
    const [isCurrentUserBlocked, setIsCurrentUserBlocked] = useState(false);
    const [localBlockStatus, setLocalBlockStatus] = useState(false);
    const { ShowDetail, setShowDetail } = useDetailUiStore();

    const [arrows, setArrows] = useState({
        chatSettings: false,
        privacyHelp: false,
        sharedPhotos: false,
        sharedFiles: false,
    });

    const handleBlock = async () => {
        if (!user || isUserBlockingMe) {
            console.log("Cannot block this user because they have already blocked you.");
            return;
        }

        const userDocRef = doc(db, "users", currentUser.id);

        try {
            const newBlockStatus = !isCurrentUserBlocked;
            setLocalBlockStatus(newBlockStatus);

            await updateDoc(userDocRef, {
                blocked: newBlockStatus ? arrayUnion(user.id) : arrayRemove(user.id),
            });
            console.log('Block status updated in Firestore:', newBlockStatus);
        } catch (error) {
            console.log('Error updating block status:', error);
        }
    };

    const changeArrow = (section) => {
        setArrows((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    useEffect(() => {
        const checkIfUserIsBlockingMe = async () => {
            if (!user || !currentUser) return;

            try {
                const otherUserDocRef = doc(db, "users", user.id);
                const otherUserDoc = await getDoc(otherUserDocRef);

                if (otherUserDoc.exists()) {
                    const otherUserData = otherUserDoc.data();
                    const userIsBlockingMe = otherUserData?.blocked?.includes(currentUser.id);
                    setIsUserBlockingMe(userIsBlockingMe);
                }
            } catch (error) {
                console.log('Error checking if user is blocking:', error);
            }
        };

        checkIfUserIsBlockingMe();
    }, [user?.id, currentUser?.id]);

    useEffect(() => {
        const checkIfCurrentUserBlocked = async () => {
            if (!currentUser || !user) return;

            try {
                const currentUserDocRef = doc(db, "users", currentUser.id);
                const currentUserDoc = await getDoc(currentUserDocRef);

                if (currentUserDoc.exists()) {
                    const currentUserData = currentUserDoc.data();
                    const isBlocked = currentUserData?.blocked?.includes(user.id);
                    setIsCurrentUserBlocked(isBlocked);
                    setLocalBlockStatus(isBlocked);
                }
            } catch (error) {
                console.log('Error checking if current user is blocking:', error);
            }
        };

        checkIfCurrentUserBlocked();
    }, [user?.id, currentUser?.id]);

    useEffect(() => {
        if (currentUser && user) {
            const userDocRef = doc(db, "users", currentUser.id);
            const unsubscribe = onSnapshot(userDocRef, (doc) => {
                const data = doc.data();
                const isBlockedByCurrentUser = data?.blocked?.includes(user.id);
                setIsCurrentUserBlocked(isBlockedByCurrentUser);
                setLocalBlockStatus(isBlockedByCurrentUser);
            });

            return () => unsubscribe();
        }
    }, [currentUser?.id, user?.id]);

    useEffect(() => {
        if (user && currentUser) {
            const userDocRef = doc(db, "users", user.id);
            const unsubscribe = onSnapshot(userDocRef, (doc) => {
                const data = doc.data();
                const isBlockingCurrentUser = data?.blocked?.includes(currentUser.id);
                setIsUserBlockingMe(isBlockingCurrentUser);
            });

            return () => unsubscribe();
        }
    }, [user?.id, currentUser?.id]);

    return (
        <div className='detail' style={{ display: ShowDetail ? 'flex' : 'none' }}>
            <img
                src="./arrowDown.png"
                style={{ height: '20px', width: '20px', transform: 'rotate(90deg)', position: 'absolute', top: '15px', left: '15px' }}
                onClick={() => setShowDetail(!ShowDetail)}
            />
            <div className="user">
                <img src={user?.avatar || "./avatar.png"} alt="" />
                <h3>{user?.username || "Unknown User"}</h3>
                <p style={{ fontSize: '0.8em' }}>{user?.bio || "No bio available"}</p>
            </div>

            <div className="info">
                <div className="option">
                    <div className="title">
                        <span>Chat Settings</span>
                        <img
                            src={arrows.chatSettings ? "./arrowDown.png" : "./arrowUp.png"}
                            onClick={() => changeArrow('chatSettings')}
                            alt=""
                        />
                    </div>
                </div>
            </div>

            <div className="info">
                <div className="option">
                    <div className="title">
                        <span>Privacy & help</span>
                        <img
                            src={arrows.privacyHelp ? "./arrowDown.png" : "./arrowUp.png"}
                            onClick={() => changeArrow('privacyHelp')}
                            alt=""
                        />
                    </div>
                </div>
            </div>

            <div className="info">
                <div className="option">
                    <div className="title">
                        <span>Shared Photos</span>
                        <img
                            src={arrows.sharedPhotos ? "./arrowDown.png" : "./arrowUp.png"}
                            onClick={() => changeArrow('sharedPhotos')}
                            alt=""
                        />
                    </div>
                    <div className="photos" style={{ display: arrows.sharedPhotos ? 'flex' : 'none' }}>
                        {/* Replace these items with actual data */}
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="./public/bg.jpg" className='icon' alt="" />
                                <span>photo_2024_2.png</span>
                            </div>
                            <img src="./download.png" alt="" width={'20px'} height={'20px'} />
                        </div>
                        {/* Repeat for more photos */}
                    </div>
                </div>
            </div>

            <div className="info">
                <div className="option">
                    <div className="title">
                        <span>Shared Files</span>
                        <img
                            src={arrows.sharedFiles ? "./arrowDown.png" : "./arrowUp.png"}
                            onClick={() => changeArrow('sharedFiles')}
                            alt=""
                        />
                    </div>
                </div>
            </div>

            <div className="buttons">
                <button
                    onClick={handleBlock}
                    disabled={isUserBlockingMe}
                    style={{ backgroundColor: (isUserBlockingMe || isCurrentUserBlocked) ? 'rgba(220, 20, 60, 0.796)' : 'rgba(230, 74, 105, 0.553)' }}
                >
                    {isUserBlockingMe
                        ? "User has Blocked You!"
                        : isCurrentUserBlocked
                            ? "User Blocked"
                            : localBlockStatus
                                ? "User Blocked"
                                : 'Block User'}
                </button>
                <button className='logout' onClick={() => auth.signOut()}>Log out</button>
            </div>
        </div>
    );
};

export default Detail;
