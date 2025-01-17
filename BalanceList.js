import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { useRoute } from '@react-navigation/native';

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const BalanceList = () => {
    const route = useRoute();
    const { id } = route.params;
    const [totalIncomeData, setTotalIncome] = useState([]);
    const [totalCostData, setExpenseCost] = useState([]);

    useEffect(() => {
        const userId = id;
        if (id) {
            fetch(`https://exciting-spice-armadillo.glitch.me/getSourceData/${userId}`)
                .then(res => res.json())
                .then(data => setTotalIncome(data))
                .catch(err => console.log(err));
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetch(`https://exciting-spice-armadillo.glitch.me/getExpenseCost/${id}`)
                .then((res) => res.json())
                .then((data) => setExpenseCost(data))
                .catch((err) => console.log(err));
        }
    }, [id]);


    const years = [...new Set(totalIncomeData.map(item => item.year))];
    const groupedArray = [];


    years.forEach(year => {
        for (let i = 1; i <= 12; i++) {
            const income = totalIncomeData
                .filter(item => item.month == i && item.year == year)
                .reduce((acc, curr) => acc + curr.amount, 0);

            const expenses = totalCostData
                .filter(item => item.month == i && item.year == year)
                .reduce((acc, curr) => acc + curr.cost, 0);

            const balance = income - expenses;

            if (income > 0 || expenses > 0) {
                groupedArray.push({
                    year,
                    month: monthNames[i - 1],
                    income,
                    expenses,
                    balance,
                });
            }
        }
    });

    groupedArray.sort((a, b) => {
        if (a.year !== b.year) {
            return b.year - a.year;
        }
        return monthNames.indexOf(b.month) - monthNames.indexOf(a.month);
    });

    const totalBalance = groupedArray.reduce((acc, curr) => acc + curr.balance, 0);

    return (
        <View style={styles.container}>
            <View style={styles.totalBalanceContainer}>
                <Text style={styles.totalBalanceText}>
                    Total Available Balance: {totalBalance.toFixed(2)}
                </Text>
            </View>

            <FlatList
                data={groupedArray.filter(item => item.income !== 0)}
                keyExtractor={(item) => `${item.month}-${item.year}`}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card}>
                        <ImageBackground
                            source={{
                                uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1721734044/black-white_iidqap.webp',
                            }}
                            style={styles.backgroundImage}
                            imageStyle={{ borderRadius: 10 }}
                        >
                            <View style={styles.cardContent}>
                                <Text style={[styles.cardText, styles.cardMonth]}>{item.month}-{item.year}</Text>
                                <Text style={[styles.cardText, styles.cardIncomeText]}>
                                    income {item.income}
                                </Text>
                                <Text style={[styles.cardText, styles.cardExpenseText]}>
                                    expence {Math.abs(item.expenses)}
                                </Text>
                                <Text style={[styles.cardText, styles.cardBalanceText]}>
                                    balance  {item.balance}
                                </Text>
                            </View>
                        </ImageBackground>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    card: {
        marginBottom: 15,
        borderRadius: 10,
        overflow: 'hidden',
        height: 120,
    },
    backgroundImage: {
        width: '100%',
        height: 120,
        justifyContent: 'flex-end',
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    cardText: {
        fontSize: 16,
        color: 'white',
    },
    cardMonth: {
        flex: 2,
        fontWeight: 'bold',
    },
    cardIncomeText: {
        flex: 1,
        color: 'blue',
    },
    cardExpenseText: {
        flex: 1,
        color: 'red',
    },
    cardBalanceText: {
        flex: 1,
        color: 'green',
    },
    totalBalanceContainer: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 10,
    },
    totalBalanceText: {
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default BalanceList;
