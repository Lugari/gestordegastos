export const COLORS = {
  primary: '#ADC4CD',
  secondary: '#95E495',
  neutral: '#B8B688',
  accent: '#E4EB2A',
  danger: '#D76A61',
  success: '#228B22',
  background: '#F8F9FA',
  textPrimary: '#000',
  textSecondary: '#4f6057',
  lightGray: '#f1f1f1',
  darkGray: '#333',
};

export const SIZES = {
  base: 8,
  font: 14,
  radius: 10,
  padding: 16,
  margin: 16,
};

export const FONTS = {
    body: { fontFamily: 'Roboto', fontSize: SIZES.font, fontWeight: '500'},
    heading: { fontFamily: 'Roboto', fontSize: SIZES.font * 1.5, fontWeight: '700'},
    subheading: { fontFamily: 'Roboto', fontSize: SIZES.font * 1.2, fontWeight: '600'},
    button: { fontFamily: 'Roboto', fontSize: SIZES.font, fontWeight: '700'},

}

export const SHADOWS = {

}

export const theme = {
    colors: COLORS,
    sizes: SIZES,
    fonts: FONTS,
    shadows: SHADOWS,
};

export default theme;