import React from 'react'
import PhoneInput from 'react-phone-number-input'
import axios from 'axios'

import 'react-phone-number-input/style.css'

export default class BuyForm extends React.Component {
    constructor(props) {
        super(props)
        this.props = props

        this.api = window.location.origin + '/api/'
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

    submitForm(e) {
        e.preventDefault()
        const data = new FormData() 
        data.append('stl', this.props.file)
        data.append('material', this.props.material)
        data.append('color', this.props.color)
        data.append('quality', this.props.quality)
        data.append('price', this.props.price.global)
        data.append('name', this.state.name)
        data.append('email', this.state.email)
        data.append('phone', this.state.phone)
        data.append('street', this.state.street)
        data.append('city', this.state.city)
        data.append('state', this.state.state)
        data.append('country', this.state.country)
        data.append('postal', this.state.postal)
        axios
            .post(this.api + 'printing', data)
            .catch(() => console.error('Connection error'))
    }

    render() {
        return (
            <form
                className='buy-form'
                method='POST'
                onSubmit={e => this.submitForm(e)}
                encType='multipart/form-data'
            >
                <h3>{this.props.price.local !== this.props.price.global
                    ? `${this.props.price.local.toFixed(2)} ${this.getCookie('CLIENT_CURRENCY')} ≈ ${this.props.price.global.toFixed(2)} USD`
                    : `${this.props.price.global.toFixed(2)} USD`
                }</h3>
                <p style={{fontStyle: 'oblique'}}>Dear Customer! Calculated initial price may be different from the actual price of a print.
                This can be caused by eg. corrupted model or model improperly placed in 3D space.</p>
                <p style={{fontStyle: 'oblique'}}>Additionally, price does not include shipping costs!</p>
                <input
                    type='text'
                    name='name'
                    onChange={e => this.setState({name: e.target.value})}
                    placeholder='Your first name and surname...'
                    required={true}
                />
                <input
                    type='email'
                    name='email'
                    onChange={e => this.setState({email: e.target.value})}
                    placeholder='Your email address...'
                    required={true}
                />
                <PhoneInput
                    onChange={value => this.setState({phone: value})}
                    placeholder='Your phone number...'
                    required={true}
                />
                <textarea
                    name='street'
                    rows={2}
                    cols={24}
                    onChange={e => this.setState({street: e.target.value})}
                    placeholder='Your street address...'
                    required={true}
                ></textarea>
                <input
                    type='text'
                    name='city'
                    onChange={e => this.setState({city: e.target.value})}
                    placeholder='Your city...'
                    required={true}
                />
                <input
                    type='text'
                    name='country'
                    onChange={e => this.setState({country: e.target.value})}
                    placeholder='Your country...'
                    required={true}
                />
                <input
                    type='text'
                    name='state'
                    onChange={e => this.setState({state: e.target.value})}
                    placeholder='Your state...'
                    required={false}
                />
                <input
                    type='text'
                    name='postal'
                    onChange={e => this.setState({postal: e.target.value})}
                    placeholder='Your postal/ZIP Code...'
                    required={true}
                />
                <input type='submit' name='submit' value='Request printing'/>
            </form>
        )
    }
}
