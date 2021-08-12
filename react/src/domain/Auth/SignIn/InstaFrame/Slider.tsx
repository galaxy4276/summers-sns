import React, { ReactElement } from 'react';
import { Settings } from 'react-slick';
import { InstaImage, ReactSlider } from './styles';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const config: Settings = {
	accessibility: false,
	adaptiveHeight: true,
	arrows: false,
	autoplaySpeed: 3000,
	autoplay: true,
	dots: false,
	draggable: false,
	infinite: true,
};

function InstaSlider(): ReactElement {
	return (
		<ReactSlider {...config}>
			<InstaImage>1</InstaImage>
			<InstaImage>2</InstaImage>
			<InstaImage>3</InstaImage>
		</ReactSlider>
	);
}

export default InstaSlider;
