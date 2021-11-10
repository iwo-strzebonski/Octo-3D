import React from 'react'

import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import axios from 'axios'

export default class Contact extends React.Component {
    constructor() {
        super()

        this.api = window.location.origin + '/api/'

        this.state = {
            success: -1,
            name: '',
            email: '',
            phone: '',
            message: ''
        }
    }

    submitForm(e) {
        e.preventDefault()
        const data = new FormData()
        data.append('name', this.state.name)
        data.append('email', this.state.email)
        data.append('phone', this.state.phone)
        data.append('message', this.state.message)

        axios
            .post(this.api + 'contact', data)
            .then(() => this.setState({success: 1}))
            .catch(() => this.setState({success: 0}))
    }

    render() {
        return (
            <main className='App-main'>
                {this.state.success > -1
                    ? <h3>{this.state.success === 1
                        ? 'Your message has successfully sent!'
                        : 'A problem occured when sending your message. We are sorry for the inconvenience.'
                    }</h3>
                    : null
                }
                <form
                    className='contact-form'
                    method='POST'
                    onSubmit={(e) => this.submitForm(e)}
                >
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
                        required={false}
                    />
                    <textarea
                        name='message'
                        onChange={e => this.setState({message: e.target.value})}
                        placeholder='Your message...'
                        required={true}
                    ></textarea>
                    <input type='submit' name='submit' value='Submit contact form'/>
                </form>
            </main>
        )
    }
}
