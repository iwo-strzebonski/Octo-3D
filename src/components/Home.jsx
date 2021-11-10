import React from 'react'

export default class Home extends React.Component {
    constructor() {
        super()
        this.state = {}
    }

    render() {
        return (
            <main className='App-main'>
                <h1 className='App-h1'>Octo-3D Printing Services</h1>
                <h2 className='App-h2'>Who are we?</h2>
                <div className='App-content'>
                    We are a group which is interested in 3D printing and 3D design.
                </div>
                <h2 className='App-h2'>What are our goals?</h2>
                <div className='App-content'>
                    We are aiming at providing our customers with cheap 3D printing services.
                    Our Customers can use our price calculator to check the cost of printing their models.
                </div>
                <h2 className='App-h2'>Why us?</h2>
                <div className='App-content'>
                    Well, first of all, we are relatively cheap in comparison to other businesses.
                    Additionally we provide support for our Customers regarding using our tools and prints
                </div>
                <h2 className='App-h2'>What we have printed so far?</h2>
                <div className='App-content'>
                    You can look in the Gallery tab for opinions of our Customers and what we have printed for them.
                </div>
            </main>
        )
    }
}
