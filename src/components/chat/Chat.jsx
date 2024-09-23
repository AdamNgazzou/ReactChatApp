import React, { useEffect, useRef, useState } from 'react';
import './Chat.css';
import EmojiPicker from 'emoji-picker-react';
import { arrayUnion, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';
import uploadaudio from '../../lib/uploadaudio';
import { useDropzone } from 'react-dropzone';
import { useUiStore } from '../../lib/uiStore';
import { useDetailUiStore } from '../../lib/detailui';

const Chat = () => {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [chat, setChat] = useState(null);
    const [img, setImg] = useState({
        file: null,
        url: "",
    });
    const [audioBlob, setAudioBlob] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const endRef = useRef(null);

    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
    const { currentUser } = useUserStore();
    const { chatorchatlist, setChatorchatlist } = useUiStore();
    const { ShowDetail, setShowDetail } = useDetailUiStore();

    const mediaQuery = window.matchMedia("(max-width: 768px)");



    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "auto" });
    }, [chat]);

    const handleEmoji = (e) => {
        setText(prev => prev + e.emoji);
        setOpen(false);
    };

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            setChat(res.data());
        });
        return () => {
            unSub();
        };
    }, [chatId]);

    const handleSend = async () => {
        if (!text && !img.file && !audioBlob) return;

        let imgUrl = null;
        let audioUrl = null;

        try {
            if (img.file) {
                imgUrl = await upload(img.file);
            }

            if (audioBlob) {
                const audioFile = new File([audioBlob], 'voice_message.wav', { type: 'audio/wav' });
                audioUrl = await uploadaudio(audioFile);
            }

            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text: text || "",
                    createdAt: new Date(),
                    ...(imgUrl && { img: imgUrl }),
                    ...(audioUrl && { audio: audioUrl }),
                }),
            });

            const userIDs = [currentUser.id, user.id];
            for (const id of userIDs) {
                const userChatRef = doc(db, "userchats", id);
                const userChatsSnapshot = await getDoc(userChatRef);

                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data();
                    const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);

                    if (chatIndex !== -1) {
                        userChatsData.chats[chatIndex].lastMessage = text || "Audio";
                        userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
                        userChatsData.chats[chatIndex].updatedAt = Date.now();

                        await updateDoc(userChatRef, {
                            chats: userChatsData.chats,
                        });
                    }
                } else {
                    await setDoc(userChatRef, {
                        chats: [{
                            chatId,
                            lastMessage: text || "Audio",
                            isSeen: id === currentUser.id,
                            updatedAt: Date.now(),
                            receiverId: user.id,
                        }],
                    });
                }
            }

            setText("");
            setAudioBlob(null);
        } catch (error) {
            console.log(error);
        }

        setImg({ file: null, url: "" });
    };

    const handleRecordStart = () => {
        setIsRecording(true);
        setAudioBlob(null);

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorderRef.current = new MediaRecorder(stream);
                const audioChunks = [];

                mediaRecorderRef.current.ondataavailable = event => {
                    audioChunks.push(event.data);
                };

                mediaRecorderRef.current.onstop = async () => {
                    const blob = new Blob(audioChunks);
                    setAudioBlob(blob);
                    await handleSend(); // Send the audio message when recording stops
                };

                mediaRecorderRef.current.start();
            });
    };

    const handleRecordStop = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSend();
        }
    };

    const handleImage = e => {
        if (e.target.files[0]) {
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            });
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': []
        },
        onDrop: (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (file) {
                setImg({
                    file,
                    url: URL.createObjectURL(file)
                });
            }
        },
        noClick: true,
        noKeyboard: true
    });
    console.log(ShowDetail);



    return (
        <div className='chat' style={{ display: (((chatorchatlist || !mediaQuery.matches) || !ShowDetail)) ? 'flex' : 'none' }}>
            <div className="top">
                <div className="user">
                    <img src={user?.avatar || "./avatar.png"} alt="" />
                    <div className="texts">
                        <span>{user?.username || "Unknown User"}</span>
                        <p>her i am adam ngazzou</p>
                    </div>
                </div>
                <div className="icons">
                    <img src="./phone.png" alt="" />
                    <img src="./video.png" alt="" />
                    <img src="./info.png" onClick={() => setShowDetail(!ShowDetail)} alt="" />
                </div>
            </div>
            <div className="center" onClick={() => setOpen(false)} {...getRootProps()} style={{ border: isDragActive ? '2px dashed gray' : 'none', display: 'flex', alignItems: isDragActive ? "center" : 'flex-start', justifyContent: isDragActive ? "center" : "flex-start" }}>
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p>Drop the image here...</p>
                ) : (
                    chat?.messages?.map((message) => (
                        <div className={`message ${message.senderId === currentUser.id ? "own" : ""}`} key={message.createdAt}>
                            {user && message.senderId === user.id ? <img src={user.avatar} alt="" /> : null}
                            <div className="texts">
                                {message.img && <img src={message.img} alt="" />}
                                {message.text && <p title={new Date(message.createdAt.seconds * 1000).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    hour12: true
                                })}>
                                    {message.text}
                                </p>}
                                {message.audio && <audio controls src={message.audio}></audio>}
                            </div>
                        </div>
                    ))
                )}
                {img.url && <div className="message own">
                    <div className="texts">
                        <img src={img.url} alt="" />
                    </div>
                </div>}
                <div ref={endRef}></div>
            </div>
            <div className="bottom">
                <div className="icons">
                    <label htmlFor="file">
                        <img src="./img.png" alt="" style={{ cursor: (isCurrentUserBlocked || isReceiverBlocked) ? "not-allowed" : "pointer" }} />
                    </label>
                    <input type="file" id="file" style={{ display: "none" }} onChange={handleImage} />
                    <img src="./camera.png" alt="" style={{ cursor: (isCurrentUserBlocked || isReceiverBlocked) ? "not-allowed" : "pointer" }} />
                    <img onClick={isRecording ? handleRecordStop : handleRecordStart} src="./mic.png" alt="" style={{ cursor: (isCurrentUserBlocked || isReceiverBlocked) ? "not-allowed" : "pointer" }} />
                    {isRecording && <div>Recording... Click again to stop.</div>}
                </div>
                <input
                    type="text"
                    value={text}
                    placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "you can't write here" : 'Type a message...'}
                    onChange={e => setText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isCurrentUserBlocked || isReceiverBlocked}
                />
                <div className="emoji">
                    <img src="./emoji.png" alt=""
                        style={{ cursor: (isCurrentUserBlocked || isReceiverBlocked) ? "not-allowed" : "pointer" }}
                        onClick={() => setOpen(prev => !prev)}
                    />
                    <div className="picker">
                        <EmojiPicker open={open} onEmojiClick={handleEmoji} />
                    </div>
                </div>
                <button className="sendButton" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>Send</button>
            </div>
        </div>
    );
};

export default Chat;
