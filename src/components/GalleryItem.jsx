import React from 'react'

export default class GalleryItem extends React.Component {
    render() {
        return (
            <div className='gallery-item'>
                <img alt={this.props.alt} src={this.props.src} />
                <div className='gallery-description'>
                    <div className='gallery-title'>Title: <h3>{this.props.title}</h3></div>
                    <div className='gallery-material'>Material: <em>{this.props.material}</em></div>
                    <div className='gallery-opinion'>Opinion: <blockquote>{this.props.opinion}</blockquote></div>
                    <div>Stars: <div className='gallery-stars'>{this.props.stars}</div></div>
                </div>
            </div>
        )
    }
}
