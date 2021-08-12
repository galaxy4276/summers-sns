import React, { ReactElement } from 'react';
import { Container, Flex } from '@chakra-ui/react';
import InstaHeader from './Header';
import InstaSlider from './Slider';
import InstaBottomMenu from './BottomMenu';

function InstaFrame(): ReactElement {
	return (
		<Container backgroundColor="white" w={[200, 250, 350]}>
			<Flex flexDir="column">
				<InstaHeader />
				<Flex flexDir="column">
					<InstaSlider />
				</Flex>
				<InstaBottomMenu />
			</Flex>
		</Container>
	);
}

export default InstaFrame;
