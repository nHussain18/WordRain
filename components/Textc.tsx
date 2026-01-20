import { Colors, Fonts } from "@/constants/theme";
import React, { memo, useMemo } from "react";
import { Text, TextStyle } from "react-native";

type Props = {
  value?: string;
  children?: React.ReactNode;
  size?: number;
  lineHeight?: number;
  fontFamily?: string;
  bold?: boolean;
  semiBold?: boolean;
  medium?: boolean;
  style?: TextStyle;
  color?: string;
  center?: boolean;
  numberOfLines?: number;
  shadow?: boolean;
};

const Textc = ({
  value,
  children,
  size = 14,
  lineHeight,
  bold = false,
  semiBold = false,
  medium = false,
  style,
  color = Colors.text,
  numberOfLines,
  fontFamily,
  center = false,
  shadow = false,
}: Props) => {

  const resolvedFont = useMemo(() => {
    if (fontFamily) return fontFamily;
    if (bold) return Fonts.Bold;
    if (semiBold) return Fonts.SemiBold;
    if (medium) return Fonts.Medium;
    return Fonts.Regular;
  }, [fontFamily, bold, semiBold, medium]);

  const textStyle = useMemo<TextStyle>(() => ({
    color,
    fontSize: size,
    lineHeight: lineHeight ?? Math.round(size * 1.5),
    fontFamily: resolvedFont,
    textAlign: center ? "center" : "left",
    ...(shadow && {
      textShadowColor: Colors.black,
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 4,
    }),
  }), [color, size, lineHeight, resolvedFont, center, shadow]);

  return (
    <Text
      style={[textStyle, style]}
      numberOfLines={numberOfLines}
    >
      {children ?? value}
    </Text>
  );
};

export default memo(Textc);
