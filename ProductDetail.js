import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { Image, View, Text, StyleSheet } from 'react-native';
import LoaderSpinner from './LoaderSpinner';

const ProductDetail = () => {
    const route = useRoute();
    const { id, itemId } = route.params;
    console.log(id)
    console.log(itemId)
    const [expenseData, setExpenseData] = useState({});
      const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true)
        fetch(`https://exciting-spice-armadillo.glitch.me/getExpenseCostByItemId/${id}/${itemId}`)
            .then((res) => res.json())
            .then((data) => setExpenseData(data))
            .catch((err) => console.error(err))
            .finally(() => {
                setLoading(false); 
              });
    }, [id, itemId]);

    console.log(expenseData)

    return (
        <View style={styles.card}>
            <LoaderSpinner shouldLoad={loading} />
            <Text style={styles.title}>Expense: {expenseData.product}</Text>
            <View style={{ display: "flex", flexDirection: "row" }}>
                <Text style={{ flex: 1 }}>Category: {expenseData.category}</Text>
                <Text style={{ flex: 1, textAlign: "right" }}>Cost: {expenseData.cost}</Text>
            </View>

            <View style={{ display: "flex", flexDirection: "row" }}>
                <Text style={{ flex: 1 }}>Date: {expenseData.p_date}</Text>
                <Text style={{ flex: 1, textAlign: "right" }}>Tax Applicable: {expenseData.is_tax_app}</Text>
            </View>

            <View style={{ display: "flex", flexDirection: "row" }}>
                {expenseData.is_tax_app !== "no" && <Text style={{ flex: 1 }}>Tax Percentage: {expenseData.percentage}</Text>}
                {expenseData.is_tax_app !== "no" && <Text style={{ flex: 1, textAlign: "right" }}>Tax Amount: {expenseData.tax_amount}</Text>}
            </View>
            {expenseData.description && <Text>Description: {expenseData.description}</Text>}
            {expenseData.image && (
                <Image
                    source={{ uri: expenseData.image }}
                    style={styles.image}
                />
            )}

        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        margin: 16,
        borderRadius: 8,
        padding: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    image: {
        width: '100%',
        height: '80%',
        marginTop: 20,
        marginBottom: 8,
        borderRadius: 8,
    },
});

export default ProductDetail