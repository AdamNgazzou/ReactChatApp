
import React from 'react'
import './List.css'
import Userinfo from './userInfo/Userinfo'
import Chatlist from './chatList/chatList'
import { useUiStore } from '../../lib/uiStore'


const list = () => {
    const { chatorchatlist, setChatorchatlist } = useUiStore();
    const mediaQuery = window.matchMedia("(max-width: 768px)");


    return (
        <div className='list' style={{ display: (chatorchatlist && mediaQuery.matches) ? 'none' : 'flex' }}>
            <Userinfo />
            <Chatlist />
        </div>
    )
}

export default list
