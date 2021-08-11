import { extendTheme } from '@chakra-ui/react';

const index = extendTheme({
  global: {
    body: {
      bg: 'gray.100',
    },
  },
  colors: {
    sadgray: '#FAFAFA',
    happyblue: {
      0: '#9DC9CC',
      1: '#3FC1C9',
    },
  },
});

export default index;
