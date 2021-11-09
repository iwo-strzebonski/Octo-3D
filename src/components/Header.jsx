import React from 'react'
import { Link } from 'react-router-dom'

import logo from '../img/logo.png'
import '../style/Header.css'

export default class Header extends React.Component {
    constructor() {
        super()
        this.state = {}
    }

    render() {
        return (
            <header className='App-header'>
                <Link
                    className='App-logo' 
                    onDragStart={(e) => {e.preventDefault()}}
                    to='/'
                >
                    <img
                        onDragStart={(e) => {e.preventDefault()}}
                        src={logo}
                        alt='Octo-3D'
                    />
                </Link>
                <nav className='header-nav'>
                    <ul>
                        <li><Link to='/gallery'>Gallery</Link></li>
                        <li><Link to='/pricing'>Pricing</Link></li>
                        <li><Link to='/contact'>Contact</Link></li>
                    </ul>
                </nav>
            </header>
        )
    }
}
