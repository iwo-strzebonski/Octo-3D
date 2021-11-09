import React from 'react'

import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'

export default class Contact extends React.Component {
    constructor() {
        super()
        this.state = {
            name: '',
            email: '',
            phone: '',
            message: ''
        }
    }

    render() {
        return (
            <main className='App-main'>
                <form
                    className='contact-form'
                    method='POST'
                    onSubmit={(e) => {e.preventDefault()}}       // TODO: Form submitting
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
