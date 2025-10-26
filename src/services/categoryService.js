import { parse } from "@babel/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
    import * as crypto from 'expo-crypto';

    const CATEGORY_KEY = "@categories"

/**
 * Obtiene todos las categorias desde AsyncStorage.
 * @returns {Promise<Array>} Una promesa que resuelve a un array de categorias.
 */

export const getAllCategories = async () => {
    try {
        const data = AsyncStorage.getItem(CATEGORY_KEY)
        return data ? JSON.parse(data) : []

    }
    catch (e){
        console.error("Error al obtener presupuestos:", error);
        //Manejar el error
        return [];

    }
}

export const saveAllCategories = async (categories) => {
    try {
        await AsyncStorage.setItem(CATEGORY_KEY, JSON.stringify(categories))
        

    }
    catch (e){
        console.log('ERROR al guardar la categoría', e)
    }
}

export const AddCategory = async (categoryData) => {

    const currentCategories = getAllCategories()
    const newCategory ={
        ...categoryData,
        id : crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }

    const newCurrentCategory = [...currentCategories, newCategory];
    await saveAllCategories(newCurrentCategory);
    return newCategory;
}

export const updateCategoryById = async  (id, updates) => {
    try{
        const categories = await getAllCategories();
        let categoryFound = false
            const updatedCategories = categories.map( category => {
                if(category.id === id) {
                    categoryFound = true
    
                    return {
                    ...category,
                    updates,
                    total: updates.total !== undefined ? (parseFloat(updates.total) || 0) : category.total,
                    updated_at: new Date().toISOString,
    
                    } 
                }
                return category;
            })
            if (categoryFound){

                throw new Error(`Categoría con id ${id} no encontrado para actualizar.`);
            }

            await saveAllCategories(updatedCategories)
            
            const finalUpdatedCategory = updatedCategories.find(c => c.id === id);
            return finalUpdatedCategory;
        }
    catch{
        console.error("Error al actualizar categoria:", error);
        throw error;
    }
}

export const deleteCategoryById = async (id) => {
    try{
        const currentCategories = await getAllCategories();
        const newCategories =  currentCategories.filter(c => c.id!== id);
        await saveAllCategories(newCategories)
    }
    catch{
        console.error("Error al eliminar categoria:", error);
        throw error;
    }
}