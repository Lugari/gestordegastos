import React, { useState } from 'react';
import {
    View,
    Modal,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SecondaryButton from './SecondaryButton'; // Asegúrate de que la ruta sea correcta
import { COLORS, SIZES } from '../constants/theme';

/**
 * Un botón que abre un modal para seleccionar un ícono de una lista.
 * @param {object} props
 * @param {string[]} props.iconList - Un array con los nombres de los íconos de MaterialIcons a mostrar.
 * @param {(iconName: string) => void} props.onSelect - Función que se llama con el nombre del ícono seleccionado.
 * @param {string} [props.title="Seleccionar Ícono"] - El texto que se mostrará en el botón.
 */
const IconPicker = ({ iconList, onSelect, title = "Seleccionar Ícono" }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const handleIconSelect = (iconName) => {
        onSelect(iconName); // 1. Devuelve el nombre del ícono al componente padre
        setModalVisible(false); // 2. Cierra el modal
    };

    // Renderiza cada ícono en la lista
    const renderIcon = ({ item }) => (
        <TouchableOpacity style={styles.iconContainer} onPress={() => handleIconSelect(item)}>
            <MaterialIcons name={item} size={32} color="#333" />
            <Text style={styles.iconName}>{item.replace(/-/g, ' ')}</Text>
        </TouchableOpacity>
    );

    return (
        <View>
            <SecondaryButton title={title} onPress={() => setModalVisible(true)} />

            <Modal
                animationType="slide"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Selecciona un Ícono</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <MaterialIcons name="close" size={28} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={iconList}
                        renderItem={renderIcon}
                        keyExtractor={(item) => item}
                        numColumns={4} // Muestra los íconos en una cuadrícula de 4 columnas
                        contentContainerStyle={styles.list}
                    />
                </SafeAreaView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    list: {
        paddingHorizontal: SIZES.padding * 0.5,
    },
    iconContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SIZES.padding,
        margin: 4,
        borderRadius: 8,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    iconName: {
        marginTop: 8,
        fontSize: SIZES.font * 0.8,
        textAlign: 'center',
        color: COLORS.textSecondary
    }
});

export default IconPicker;