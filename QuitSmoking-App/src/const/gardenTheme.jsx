// Garden theme constants for the whole project

const gardenTheme = {
  colors: {
    primary: '#27ae60', // xanh lá đậm
    primaryLight: '#43e97b', // xanh lá tươi
    primarySoft: '#b9f6ca', // xanh lá nhạt
    background: '#fff',
    backgroundSoft: '#e8fce8',
    card: '#fff',
    text: '#222', // đen nhạt
    textSecondary: '#444', // xám đậm
    border: '#222',
    borderSoft: '#eee',
    shadow: '#333',
    disabled: '#bdbdbd',
    error: '#e74c3c',
    white: '#fff',
  },
  fontWeight: {
    regular: '400',
    medium: '600',
    bold: '800',
  },
  borderRadius: {
    card: 24,
    button: 18,
    avatar: 60,
  },
  shadow: {
    card: {
      shadowColor: '#333',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.10,
      shadowRadius: 18,
      elevation: 8,
    },
    avatar: {
      shadowColor: '#333',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.13,
      shadowRadius: 16,
      elevation: 7,
    },
  },
};

export default gardenTheme; 