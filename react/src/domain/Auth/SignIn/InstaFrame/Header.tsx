import React, { ReactElement } from 'react';
import { Flex } from '@chakra-ui/react';
import { SvgMenu } from '@components/Svgs';
import { Profile, Header, Span } from './styles';

function InstaHeader(): ReactElement {
	return (
		<Header justify="space-between" align="center" h={50}>
			<Flex>
				<Profile />
				<Span>anonymous</Span>
			</Flex>
			<SvgMenu />
		</Header>
	);
}

export default InstaHeader;
