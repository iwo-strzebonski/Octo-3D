import React from 'react'

export default class Page404 extends React.Component {
    constructor() {
        super()
        this.state = {}
        this.path = window.location.pathname.slice(1)
        this.path = this.path.charAt(0).toUpperCase() + this.path.slice(1)
    }

    render() {
        return (
            <main className='App-main Main-404'>
                Error 404 - Page Not Found
            </main>
        )
    }
}
