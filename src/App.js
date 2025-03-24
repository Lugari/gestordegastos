import React from 'react';
import { View, Alert } from 'react-native';
import  ButtonPrimary from './components/buttonPrimary';
import AddButton from './components/addButton';
import Header from './components/Header';
import CardBox from './components/CardBox';

const App = () => {
  const handlePress = () => {
    Alert.alert('Button Pressed!');
  };

  return (



    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Header username="Lucas" />
      <CardBox title="Balance total" amount="$1'000.000" seeMore="Historial de transacciones"  />
      <CardBox title="Balance total" amount="$1'000.000" seeMore="Historial de transacciones"  />
      <AddButton title="Add" onPress={handlePress} />
    </View>



  );
};

export default App;
