import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

type Props = { width?: number; height?: number };

/** Converted from the handoff's home-saved-expression.svg. */
export function SavedExpressionArt({ width = 52, height = 52 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 52 52" fill="none">
      <Path d="M20.3056 0C21.4101 -4.82784e-08 22.3055 0.89554 22.3056 2V40.8643C22.3056 47.0141 17.3207 51.9998 11.1709 52C5.02092 52 0.035126 47.0142 0.0351257 40.8643V2C0.0352555 0.895541 0.930636 4.82783e-08 2.03513 0H20.3056ZM11.1699 35.2852C8.09525 35.2854 5.60273 37.7798 5.60251 40.8564C5.60251 43.9333 8.09511 46.4285 11.1699 46.4287C14.2449 46.4287 16.7383 43.9334 16.7383 40.8564C16.738 37.7796 14.2447 35.2852 11.1699 35.2852Z" fill="url(#paint0_linear_1_143)" fillOpacity="0.6"/>
      <Path d="M30.7185 5.40309C31.4993 4.62178 32.7659 4.62178 33.5467 5.40309L46.4666 18.3318C47.2474 19.1131 47.2474 20.3806 46.4666 21.1619L19.0095 48.6375C14.6609 52.9887 7.61011 52.9887 3.2615 48.6375C-1.08717 44.2859 -1.08716 37.2302 3.2615 32.8787L30.7185 5.40309ZM11.197 35.2849C8.12233 35.2851 5.62984 37.7795 5.62966 40.8562C5.62966 43.9331 8.12222 46.4273 11.197 46.4275C14.272 46.4275 16.7654 43.9332 16.7654 40.8562C16.7652 37.7794 14.2719 35.2849 11.197 35.2849Z" fill="url(#paint1_linear_1_143)" fillOpacity="0.6"/>
      <Path d="M50.0009 29.7142C51.1054 29.7144 52.0009 30.6098 52.0009 31.7142V49.9994C52.0009 51.1038 51.1054 51.9992 50.0009 51.9994H11.1777C5.02381 51.9993 0.0351257 47.0107 0.0351257 40.8568C0.0352377 34.703 5.02388 29.7143 11.1777 29.7142H50.0009ZM11.1699 35.2855C8.09517 35.2857 5.6026 37.78 5.60251 40.8568C5.60251 43.9337 8.09511 46.4279 11.1699 46.4281C14.2449 46.4281 16.7383 43.9338 16.7383 40.8568C16.7382 37.7799 14.2448 35.2855 11.1699 35.2855Z" fill="url(#paint2_linear_1_143)" fillOpacity="0.6"/>
      <Defs>
      <LinearGradient id="paint0_linear_1_143" x1="12.0983" y1="47.3571" x2="13.0275" y2="0.928599" gradientUnits="userSpaceOnUse">
      <Stop stopColor="#D8E7FF"/>
      <Stop offset="1" stopColor="#FFBAA6"/>
      </LinearGradient>
      <LinearGradient id="paint1_linear_1_143" x1="7.53711" y1="52.002" x2="41.48" y2="15.2565" gradientUnits="userSpaceOnUse">
      <Stop stopColor="#FF6A3D"/>
      <Stop offset="1" stopColor="#D8E7FF"/>
      </LinearGradient>
      <LinearGradient id="paint2_linear_1_143" x1="0.0351256" y1="40.8568" x2="54.7542" y2="55.6961" gradientUnits="userSpaceOnUse">
      <Stop stopColor="#AECDFE"/>
      <Stop offset="1" stopColor="#D8E7FF"/>
      </LinearGradient>
      </Defs>
    </Svg>
  );
}
