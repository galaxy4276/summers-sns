import styled from '@emotion/styled';
import { Flex } from '@chakra-ui/react';
import OriginSlider from 'react-slick';

export const InstaImage = styled.div`
	width: 100%;
	height: 20rem;
	background-color: darkgray;
	text-align: center;
`;

export const Span = styled.span`
	margin-left: 0.25rem;
`;

export const Header = styled(Flex)`
	height: 3rem;
	border-bottom: 1px solid ${'#DBDBDB'};
`;

export const Bottom = styled(Flex)`
	height: 3rem;
`;

export const Profile = styled.span`
	width: 2rem;
	height: 2rem;
	border-radius: 32px;
	background-color: ${'#DBDBDB'};
`;

export const ReactSlider = styled(OriginSlider)`
	height: 70%;
`;
