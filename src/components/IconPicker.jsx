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
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import SecondaryButton from './SecondaryButton'; // Asegúrate de que la ruta sea correcta
import { SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

/**
 * Un botón que abre un modal para seleccionar un ícono de una lista.
 * @param {object} props
 * @param {string[]} props.iconList - Un array con los nombres de los íconos de MaterialIcons a mostrar.
 * @param {(iconName: string) => void} props.onSelect - Función que se llama con el nombre del ícono seleccionado.
 * @param {string} [props.title="Seleccionar Ícono"] - El texto que se mostrará en el botón.
 */
const IconPicker = ({ iconList, onSelect, title = "Seleccionar Ícono" }) => {
    const { theme } = useTheme();
    const styles = React.useMemo(() => makeStyles(theme), [theme]);
    const [modalVisible, setModalVisible] = useState(false);

    const handleIconSelect = (iconName) => {
        onSelect(iconName); // 1. Devuelve el nombre del ícono al componente padre
        setModalVisible(false); // 2. Cierra el modal
    };

    // Renderiza cada ícono en la lista
    const renderIcon = ({ item }) => (
        <TouchableOpacity style={styles.iconContainer} onPress={() => handleIconSelect(item)}>
            <View style={styles.iconBadge}>
                <MaterialIcons name={item} size={28} color={theme.green} />
            </View>
            <Text style={styles.iconName} numberOfLines={1}>{item.replace(/-/g, ' ')}</Text>
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
                        <Text style={styles.headerTitle}>Selecciona un ícono</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <MaterialIcons name="close" size={28} color={theme.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={[...new Set(iconList)]}
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

const makeStyles = (t) => StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: t.card,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: t.border,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: t.textPrimary,
    },
    list: {
        paddingHorizontal: SIZES.padding * 0.5,
        paddingTop: 12,
    },
    iconContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SIZES.padding * 0.75,
        margin: 4,
        borderRadius: 12,
        backgroundColor: t.cardAlt,
        borderWidth: 1,
        borderColor: t.border,
    },
    iconBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: t.greenSoft,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconName: {
        marginTop: 8,
        fontSize: SIZES.font * 0.72,
        textAlign: 'center',
        color: t.textSecondary,
        width: '100%',
    }
});

export default IconPicker;