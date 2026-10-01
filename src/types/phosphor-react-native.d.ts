declare module 'phosphor-react-native' {
  import * as React from 'react';
  import { ColorValue, StyleProp, ViewStyle } from 'react-native';

  export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

  export interface IconProps {
    size?: number;
    color?: ColorValue | string;
    secondaryColor?: ColorValue | string;
    weight?: IconWeight;
    style?: StyleProp<ViewStyle>;
  }

  export const House: React.FC<IconProps>;
  export const Trophy: React.FC<IconProps>;
  export const ChartBar: React.FC<IconProps>;
  export const Book: React.FC<IconProps>;
  export const User: React.FC<IconProps>;
  export const Check: React.FC<IconProps>;
  export const LockSimple: React.FC<IconProps>;
  export const Tooth: React.FC<IconProps>;
  export const Virus: React.FC<IconProps>;
  export const SmileySad: React.FC<IconProps>;
  export const Siren: React.FC<IconProps>;
  export const ChartLineUp: React.FC<IconProps>;
  export const FlowerLotus: React.FC<IconProps>;
  export const MusicNotes: React.FC<IconProps>;
  export const HandHeart: React.FC<IconProps>;
  export const Sparkle: React.FC<IconProps>;
}


