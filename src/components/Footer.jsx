import React from 'react'

import '../style/Footer.css'

export default class Header extends React.Component {
    constructor() {
        super()
        this.state = {}
    }

    render() {
        return (
            <footer className='App-footer'>
                <span>&copy; Octo-3D {(new Date()).getUTCFullYear()}</span>
            </footer>
        )
    }
}
