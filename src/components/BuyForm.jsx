import React from 'react'

import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'

export default class BuyForm extends React.Component {
    constructor(props) {
        super(props)
        this.props = props
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

    render() {
        return (
            <form
                className='buy-form'
                method='POST'
                onSubmit={(e) => {e.preventDefault()}}      // TODO: Form submitting
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
                    name='address'
                    rows={2}
                    cols={24}
                    onChange={e => this.setState({message: e.target.value})}
                    placeholder='Your street address...'
                    required={true}
                ></textarea>
                <input
                    type='text'
                    name='city'
                    placeholder='Your country...'
                    required={true}
                />
                <input
                    type='text'
                    name='state'
                    placeholder='Your state...'
                    required={false}
                />
                <input
                    type='text'
                    name='postal'
                    placeholder='Your postal/ZIP Code...'
                    required={true}
                />
                <input type='submit' name='submit' value='Request printing'/>
            </form>
        )
    }
}
