import React, { ReactElement } from 'react';
import { RecoilRoot } from 'recoil';
import { ChakraProvider } from '@chakra-ui/react';

function App(): ReactElement {
  return (
    <ChakraProvider>
      <RecoilRoot>
        <div>hello</div>
      </RecoilRoot>
    </ChakraProvider>
  );
}

export default App;
