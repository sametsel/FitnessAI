import { extendTheme } from 'native-base';

export const theme = extendTheme({
  colors: {
    brand: {
      50: '#E8F5E9',
      100: '#C8E6C9',
      200: '#A5D6A7',
      300: '#81C784',
      400: '#66BB6A',
      500: '#4CAF50',
      600: '#43A047',
      700: '#388E3C',
      800: '#2E7D32',
      900: '#1B5E20',
    },
    secondary: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5',
      500: '#2196F3',
      600: '#1E88E5',
      700: '#1976D2',
      800: '#1565C0',
      900: '#0D47A1',
    }
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
        rounded: 'full',
      },
    },
    Card: {
      baseStyle: {
        rounded: 'xl',
        bg: 'white',
        shadow: 2,
        p: 4,
      },
    },
    Text: {
      baseStyle: {
        color: 'coolGray.800',
      },
      defaultProps: {
        size: 'md',
      },
    },
    Heading: {
      baseStyle: {
        color: 'coolGray.800',
      },
      defaultProps: {
        size: 'lg',
      },
    },
  },
  config: {
    useSystemColorMode: false,
    initialColorMode: 'light',
  },
}); 