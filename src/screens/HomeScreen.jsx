import React from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';


import Header from '../components/Header';
import CardBox from '../components/CardBox';
import CategoryBar from '../components/CategoryBar';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';


const HomeScreen = () => {

  const navigation = useNavigation();
  

  return (

    <ScrollView style={{ flex: 1}}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 20 }}>
        <Header username= "Lucas" />


        <TouchableOpacity onPress={() => navigation.navigate('TransactionHistoryScreen')}>
          <CardBox title="Balance total" amount="$1'000.000" seeMore="Historial de transacciones"   />
        </TouchableOpacity>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 20 }}>
        
          <TouchableOpacity onPress={() => navigation.navigate('AddTransactionScreen', { transactionType: 'Ingreso' })}>
            <CardBox title="Ingresos" amount="$500.000" seeMore={<MaterialIcons name="add" size={20} color="#4AD14A" />} size="s" color="#4AD14A"/>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('AddTransactionScreen', { transactionType: 'Egreso' })}>
            <CardBox title="Egresos" amount="$500.000" seeMore={<MaterialIcons name="add" size={20} color="#D76A61" />} size="s" color="#D76A61" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('BudgetsScreen')}>

          <CardBox title="Presupuesto" amount={
            <>
            <CategoryBar name="Arriendo" total={500000} used={460000} color="#61AEE4" />
            <CategoryBar name="Servicios" total={500000} used={460000} />
            <CategoryBar name="Mercado" total={500000} used={460000} />
            </>
            } seeMore={<MaterialIcons name="expand-more" size={24} color="black" />} />

        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SavingsScreen')}>

          <CardBox title="Ahorros" amount={
            <>
            <CategoryBar name="Moto" total={5000000} used={3500000} />
            <CategoryBar name="PS5" total={500000} used={460000} />
            </>
            } seeMore={<MaterialIcons name="expand-more" size={24} color="black" />} />

        </TouchableOpacity>
      </View>

    </ScrollView>




  );
};

export default HomeScreen;
