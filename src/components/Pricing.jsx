import React from 'react'
import ActivityIndicator from './ActivityIndicator'

import axios from 'axios'

import BuyForm from './BuyForm'
import RequestPriceForm from './RequestPriceForm'

export default class Pricing extends React.Component {
    constructor() {
        super()

        this.api = window.location.origin + '/api/'

        this.state = {
            filaments: [],
            currencies: [],
            file: {},
            isSlicePending: false,
            material: '',
            color: '',
            quality: 'normal',
            price: 0
        }
    }

    componentDidMount() {
        if (!this.getCookie('CLIENT_CURRENCY')) {
            axios
                .post(this.api + 'location')
                .then(result => document.cookie = `CLIENT_CURRENCY=${result.data.currency}; SameSite=Lax`)
                .catch(() => console.error('Connection error'))
        }
        axios.post(this.api + 'filaments')
            .then(result => this.setState({
                filaments: result.data,
                material: result.data[0].material,
                color: result.data[0].color
            }))
            .catch(() => console.error('Connection error'))
        axios.post(this.api + 'currencies')
            .then(result => this.setState({currencies: result.data}))
            .catch(() => console.error('Connection error'))
    }

    checkFile(e) {
        if (e.target.files[0].size > 2 ** 20 * 40) {
            alert('Your file is too big! Please contact us individually to calculate the printing cost.')
            e.target.value = []
        } else if (e.target.files[0].name.slice(-4) !== '.stl') {
            alert('Your file is not a STL file!')
            e.target.value = []
        } else {
            this.setState({file: e.target.files[0]})
        }
    }

    sendFile(e) {
        e.preventDefault()
        const data = new FormData() 
        data.append('stl', this.state.file)
        data.append('material', this.state.material)
        data.append('color', this.state.color)
        data.append('quality', this.state.quality)
        this.setState({isSlicePending: true})
        axios
            .post(this.api + 'slice', data)
            .then(result => {
                this.setState({
                    isSlicePending: false,
                    price: result.data
                })
            })
            .catch(() => {
                this.setState({
                    isSlicePending: false,
                    price: 0
                })
                console.error('Connection error')
            })
    }

    getCookie(cName) {
        const name = cName + '='
        const cDecoded = decodeURIComponent(document.cookie)
        const cArr = cDecoded.split('; ')
        let res = null

        cArr.forEach(val => {
            if (val.indexOf(name) === 0) res = val.substring(name.length)
        })

        return res
    }

    changeState(obj) {
        this.setState(obj)
    }

    render() {
        return (
            <main className='App-main'>
                <RequestPriceForm
                    changeState={this.changeState.bind(this)}
                    checkFile={this.checkFile.bind(this)}
                    sendFile={this.sendFile.bind(this)}
                    filaments={this.state.filaments}
                    material={this.state.material}
                    currencies={this.state.currencies}
                    quality={this.state.quality}
                />
                {this.state.isSlicePending
                    ? <ActivityIndicator />
                    : null
                }
                {this.state.price !== 0
                    ? <div>
                        <BuyForm
                            material={this.state.material}
                            color={this.state.color}
                            quality={this.state.quality}
                            price={this.state.price}
                            file={this.state.file}
                        /> 
                    </div>
                    : null
                }
            </main>
        )
    }
}
