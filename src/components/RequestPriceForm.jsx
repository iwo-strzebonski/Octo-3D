import React from 'react'

export default class RequestPriceForm extends React.Component {
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
                className='pricing-form'
                onSubmit={e => this.props.sendFile(e)}
                encType='multipart/form-data'
                onChange={() => this.props.changeState({ price: 0 })}
            >
                <select
                    name='material'
                    onChange={e => this.props.changeState({
                        material: e.target.value,
                        color: this.props.filaments.find(filament => {
                            return filament.material === e.target.value
                        }).color
                    })}
                    required='true'
                >
                    {[...new Set(this.props.filaments.map(filament => {
                        return <option>{filament.material}</option>
                    }))]}
                </select>
                <select
                    name='color'
                    onChange={e => this.props.changeState({color: e.target.value})}
                    required='true'
                >
                    {this.props.filaments.filter(filament => {
                        return filament.material === this.props.material
                    }).map(filament => {
                        return <option selected>{filament.color}</option>
                    })}
                </select>
                <select
                    name='currency'
                    onChange={e => document.cookie = `CLIENT_CURRENCY=${e.target.value}`}
                    required='true'
                >
                    {this.props.currencies.map(curr => {
                        if (curr === this.getCookie('CLIENT_CURRENCY')) {
                            return <option selected>{curr}</option>
                        } else {
                            return <option>{curr}</option>
                        }
                    })}
                </select>
                <input
                    type='file'
                    name='file'
                    accept='application/sla'
                    onChange={e => this.props.checkFile(e)}
                    required={true}
                />
                <br />
                {this.props.quality !== 'normal'
                    ? <p style={{ fontWeight: 'bold' }}>Warning: Depending on project, high and low qualities may not be available.</p>
                    : null
                }
                <select
                    name='quality'
                    onChange={e => this.props.changeState({quality: e.target.value})}
                >
                    <option value='high'>High quality (+50%)</option>
                    <option selected value='normal'>Normal quality</option>
                    <option value='low'>Low quality (-25%)</option>
                </select>
                <input type='submit' value='Calculate price' />
            </form>
        )
    }
}
