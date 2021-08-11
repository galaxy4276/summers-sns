import React, { ReactElement } from 'react';
import { RecoilRoot as Recoil } from 'recoil';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import theme from '@app/Theme';
import RouterSwitch from '@app/RouterSwitch';

function App(): ReactElement {
	return (
		<Router>
			<ChakraProvider theme={theme}>
				<Recoil>
					<RouterSwitch />
				</Recoil>
			</ChakraProvider>
		</Router>
	);
}

export default App;
