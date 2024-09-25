
import React, { useState } from 'react'
import './login.css'
import { toast } from 'react-toastify'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../../lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import upload from '../../lib/upload'
import { useLoginorregisterStore } from '../../lib/loginStore'
const Login = () => {
    const [avatar, setAvatar] = useState({
        file: null,
        url: ""
    })

    const [loading, setLoading] = useState(false);


    const handleAvatar = e => {
        if (e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
    }


    const { Loginorregister, setLoginorregister } = useLoginorregisterStore();
    const mediaQuery = window.matchMedia("(max-width: 768px)");


    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const { username, email, password } = Object.fromEntries(formData);

        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);

            const imgUrl = await upload(avatar.file);

            await setDoc(doc(db, "users", res.user.uid), {
                username: username,
                email,
                avatar: imgUrl,
                id: res.user.uid,
                blocked: []
            });

            await setDoc(doc(db, "userchats", res.user.uid), {
                chats: []
            });


            toast.success("Account created! You can login now!")
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setLoading(false);

        }
    }
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData);


        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
        finally {
            setLoading(false);
        }
    };
    console.log(mediaQuery);
    console.log(Loginorregister)
    return (
        <div className='login'>
            <div className="item" style={{ display: (!Loginorregister && mediaQuery.matches) ? 'none' : 'flex' }}>
                <h2>Welcome back,</h2>
                <form onSubmit={handleLogin} >
                    <input type="email" placeholder='Email' name="email" required />
                    <input type="password" placeholder='Password' name="password" required />
                    <p style={{ display: !mediaQuery.matches ? 'none' : 'flex' }}>I don't have an account <span className='linki' onClick={() => setLoginorregister(!Loginorregister)}>Click Here</span></p>

                    <button disabled={loading}>{loading ? "Loading" : "Sign In"}</button>
                </form>
            </div>
            <div className="separator" style={{ display: !mediaQuery ? 'none' : 'flex' }}></div>
            <div className="item" style={{ display: (Loginorregister && !mediaQuery.matches) ? 'none' : 'flex' }}>
                <h2>Create an Account,</h2>
                <form onSubmit={handleRegister}>
                    <label htmlFor="file"><img src={avatar.url || "./avatar.png"} alt="" required />Upload an image</label>
                    <input type="file" id='file' style={{ display: "none" }} onChange={handleAvatar} />
                    <input type="text" placeholder='Username' name="username" required />
                    <input type="email" placeholder='Email' name="email" required />
                    <input type="password" placeholder='Password' name="password" required />
                    <p style={{ display: !mediaQuery.matches ? 'none' : 'flex' }}>i already have an account <span className='linki' onClick={() => setLoginorregister(!Loginorregister)}>Click Here</span></p>
                    <button disabled={loading}>{loading ? "Loading" : "Sign Up"}</button>
                </form>
            </div>
        </div>
    )
}

export default Login
