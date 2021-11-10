import axios from 'axios'
import React from 'react'
import GalleryItem from './GalleryItem'

export default class Gallery extends React.Component {
    constructor() {
        super()

        this.api = window.location.origin + '/api/'

        this.state = {
            opinions: []
        }
    }

    componentDidMount() {
        axios
            .post(this.api + 'opinions')
            .then(result => this.setState({
                opinions: result.data
            }))
            .catch(() => console.log('Connection error'))
    }

    render() {
        return (
            <main className='App-main'>
                {
                    this.state.opinions.map((opinion, i) => {
                        return (
                            <GalleryItem
                                key={i}
                                title={opinion.title}
                                images={opinion.images}
                                opinion={opinion.opinion}
                                score={opinion.score}
                            />
                        )
                    })
                }
                
            </main>
        )
    }
}
