import React from 'react'
import GalleryItem from './GalleryItem'

export default class Gallery extends React.Component {
    constructor() {
        super()
        this.state = {}
    }

    render() {
        return (
            <main className='App-main'>
                <GalleryItem
                    alt='test'
                    src='test'
                    title='test'
                    material='PLA'
                    opinion='2137'
                    stars='3.5'
                />
            </main>
        )
    }
}
