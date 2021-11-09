import React from 'react'
import {
    BrowserRouter as Router,
    Routes,
    Route
} from 'react-router-dom'

import Header from './Header'
import Footer from './Footer'
import Home from './Home'
import Gallery from './Gallery'
import Pricing from './Pricing'
import Contact from './Contact'
import Page404 from './404'

import '../style/App.css'
import '../style/Main.css'

export default class App extends React.Component {
    constructor(props) {
        super(props)
        this.props = props
    }

    render() {
        return (
            <div className='App'>
                <Router path='/'>
                    <Header />
                    <Routes>
                        <Route exact path='/' element={<Home/>} />
                        <Route exact path='/gallery' element={<Gallery />} />
                        <Route exact path='/pricing' element={<Pricing />} />
                        <Route exact path='/contact' element={<Contact />} />
                        <Route component={<Page404 />} />
                    </Routes>
                </Router>
                <Footer />
            </div>
        )
    }
}
