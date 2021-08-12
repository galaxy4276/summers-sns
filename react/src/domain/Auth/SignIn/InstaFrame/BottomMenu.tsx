import React, { ReactElement } from 'react';
import { Flex } from '@chakra-ui/react';
import { SvgComment, SvgHeart, SvgRibbon } from '@components/Svgs';
import { Bottom } from './styles';

function InstaBottomMenu(): ReactElement {
	return (
		<Bottom justify="space-between" align="center" h={50}>
			<Flex gridRowGap={5}>
				<SvgHeart />
				<SvgComment />
			</Flex>
			<SvgRibbon />
		</Bottom>
	);
}

export default InstaBottomMenu;
