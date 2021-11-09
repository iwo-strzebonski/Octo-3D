import React from 'react'

import '../style/ActivityIndicator.css'

export default class ActivityIndicator extends React.Component {
    constructor(props) {
        super(props)
        this.props = props
    }

    render() {
        return (
            <div className='container-loader'>
                <h4>Please wait while your request is pending...</h4>
                <div className='loader' style={this.props}></div>
            </div>
        )
    }
}
