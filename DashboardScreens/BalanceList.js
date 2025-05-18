import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import LoaderSpinner from '../LoaderSpinner';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const BalanceList = () => {
    const route = useRoute();
    const { id } = route.params;
    const [totalIncomeData, setTotalIncome] = useState([]);
    const [totalCostData, setExpenseCost] = useState([]);
    const [loading, setLoading] = useState(false);

    const getIncomeData = async () => {
        try {
            const response = await fetch(`https://exciting-spice-armadillo.glitch.me/getSourceData/${id}`);
            const data = await response.json();
            setTotalIncome(data);
        } catch (err) {
            console.log(err);
        }
    };

    const getExpenseData = async () => {
        try {
            const response = await fetch(`https://exciting-spice-armadillo.glitch.me/getExpenseCost/${id}`);
            const data = await response.json();
            setExpenseCost(data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                setLoading(true);
                await Promise.all([getIncomeData(), getExpenseData()]);
                setLoading(false);
            }
        };
        fetchData();
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

    const renderHeader = () => {
        const totalBalance = groupedArray.reduce((acc, curr) => acc + curr.balance, 0);
        const isPositiveBalance = totalBalance >= 0;
        const totalIncome = groupedArray.reduce((sum, item) => sum + item.income, 0);
        const totalExpenses = groupedArray.reduce((sum, item) => sum + item.expenses, 0);

        return (
            <View style={styles.headerMainContainer}>
                <LinearGradient  colors={isPositiveBalance ? ['#4CAF50', '#2E7D32'] : ['#F44336', '#C62828']}  style={styles.headerGradient}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerTop}>
                            <ThemedText style={styles.headerTitle}>Total Available Balance</ThemedText>
                            <Icon name={isPositiveBalance ? "trending-up" : "trending-down"} size={24} color="#FFF" />
                        </View>
                        
                        <ThemedText style={styles.balanceAmount}> ₹{Math.abs(totalBalance).toLocaleString()}</ThemedText>
                        
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Icon name="arrow-upward" size={20} color="#A5D6A7" />
                                <View style={styles.statContent}>
                                    <ThemedText style={styles.statLabel}>Total Income</ThemedText>
                                    <ThemedText style={styles.statValue}> ₹{totalIncome.toLocaleString()}</ThemedText>
                                </View>
                            </View>
                            
                            <View style={styles.divider} />
                            
                            <View style={styles.statItem}>
                                <Icon name="arrow-downward" size={20} color="#EF9A9A" />
                                <View style={styles.statContent}>
                                    <ThemedText style={styles.statLabel}>Total Expenses</ThemedText>
                                    <ThemedText style={styles.statValue}>₹{Math.abs(totalExpenses).toLocaleString()}</ThemedText>
                                </View>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        );
    };

    const renderBalanceCard = ({ item }) => {
        const isPositive = item.balance >= 0;
        return (
            <ThemedView style={styles.cardContainer}>
                <ThemedView style={styles.card}>
                    <View style={styles.cardContent}>
                        <View style={styles.monthYearContainer}>
                            <ThemedText numberOfLines={1} style={styles.monthYear}> {item.month} {item.year} </ThemedText>
                        </View>
                        
                        <View style={styles.detailsContainer}>
                            <View style={styles.detailItem}>
                                <Icon name="arrow-upward" size={20} color="#4CAF50" />
                                <ThemedText numberOfLines={1} style={styles.detailText}> ₹{item.income.toLocaleString()} </ThemedText>
                            </View>

                            <View style={styles.detailItem}>
                                <Icon name="arrow-downward" size={20} color="#F44336" />
                                <ThemedText numberOfLines={1} style={styles.detailText}>
                                    ₹{Math.abs(item.expenses).toLocaleString()}
                                </ThemedText>
                            </View>

                            <View style={styles.detailItem}>
                                <Icon name="account-balance-wallet" size={20} color={isPositive ? "#4CAF50" : "#F44336"} />
                                <ThemedText 
                                    numberOfLines={1}
                                    style={[
                                        styles.balanceText,
                                        { color: isPositive ? "#4CAF50" : "#F44336" }
                                    ]}
                                >
                                    ₹{item.balance.toLocaleString()}
                                </ThemedText>
                            </View>
                        </View>
                    </View>
                </ThemedView>
            </ThemedView>
        );
    };

    return (
        <ThemedView style={styles.container}>
            <LoaderSpinner shouldLoad={loading} />
            <View style={styles.content}>
                {renderHeader()}
                <FlatList 
                    data={groupedArray}
                    keyExtractor={(item) => `${item.month}-${item.year}`}
                    renderItem={renderBalanceCard}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    headerMainContainer: {
        marginBottom: 20,
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: 'white',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
    },
    headerGradient: {
        width: '100%',
    },
    headerContent: {
        padding: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: 18,
        color: '#FFF',
        opacity: 0.9,
        fontWeight: '500',
    },
    balanceAmount: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFF',
        marginVertical: 16,
    },
    statsContainer: {
        marginTop: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    statContent: {
        marginLeft: 12,
        flex: 1,
    },
    statLabel: {
        fontSize: 14,
        color: '#FFF',
        opacity: 0.9,
    },
    statValue: {
        fontSize: 16,
        color: '#FFF',
        fontWeight: 'bold',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: 8,
    },
    cardContainer: {
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: 'white',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        borderWidth: 2,
    },
    card: {
        borderRadius: 12,
        padding: 8,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    monthYearContainer: {
        width: '25%',
        paddingRight: 8,
    },
    monthYear: {
        fontSize: 14,
        fontWeight: 500,
        flexShrink: 1,
    },
    detailsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '75%',
        justifyContent: 'space-between',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '33%',
        paddingHorizontal: 4,
    },
    detailText: {
        fontSize: 14,
        marginLeft: 4,
        flexShrink: 1,
        textAlign: 'right',
    },
    balanceText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 4,
        flexShrink: 1,
        textAlign: 'right',
    },
    listContainer: {
        paddingBottom: 16,
    },
});

export default BalanceList;
