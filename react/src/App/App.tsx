import React, { ReactElement } from 'react';
import { RecoilRoot as Recoil } from 'recoil';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import index from '@app/Theme';

function App(): ReactElement {
  return (
    <Router>
      <ChakraProvider theme={index}>
        <Recoil>
          <div>hello</div>
        </Recoil>
      </ChakraProvider>
    </Router>
  );
}

export default App;
