import React from 'react'
import Ratings from 'react-ratings-declarative'

export default class GalleryItem extends React.Component {
    constructor(props) {
        super(props)
        this.props = props
    }

    render() {
        return (
            <div className='gallery-item'>
                {this.props.images.map((image, i) => {
                    return <img key={i} alt={this.props.title} src={`data:image/jpeg;base64,${image}`} />
                })}
                <div className='gallery-description'>
                    <div className='gallery-title'>Title: <h3>{this.props.title}</h3></div>
                    <div className='gallery-opinion'>Opinion: <blockquote>{this.props.opinion}</blockquote></div>
                    <div className='gallery-stars'>
                        <span>Score: {this.props.score}/5</span>
                        <Ratings
                            rating={this.props.score}
                            widgetDimensions='2rem'
                        >
                            <Ratings.Widget />
                            <Ratings.Widget />
                            <Ratings.Widget />
                            <Ratings.Widget />
                            <Ratings.Widget />
                        </Ratings>
                    </div>
                </div>
            </div>
        )
    }
}
