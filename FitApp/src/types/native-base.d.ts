declare module 'native-base' {
  import { ComponentType } from 'react';
  import { ViewProps } from 'react-native';

  export interface Theme {
    colors: {
      brand: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
      };
      secondary: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
      };
    };
  }

  export interface NativeBaseProviderProps {
    theme: Theme;
    children: React.ReactNode;
  }

  export const NativeBaseProvider: ComponentType<NativeBaseProviderProps>;
} 