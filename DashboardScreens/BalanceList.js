import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import LoaderSpinner from '../LoaderSpinner';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { getAllSourceData, getExpenseCosts, getSavingsData } from "../services/apiService"
import { useAuth } from '../AuthContext';

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const BalanceList = () => {
    const { id } = useAuth();
    const [totalIncomeData, setTotalIncome] = useState([]);
    const [totalCostData, setExpenseCost] = useState([]);
    const [totalSavingsData, setTotalSavings] = useState([]);
    const [loading, setLoading] = useState(false);

    const getIncomeData = async () => {
        try {
            const data = await getAllSourceData(id);
            setTotalIncome(data);
        } catch (err) {
            console.log(err);
        }
    };

    const getExpenseData = async () => {
        try {
            const data = await getExpenseCosts(id);
            setExpenseCost(data);
        } catch (err) {
            console.log(err);
        }
    };


    const getTotalSavingsData = async () => {
        setLoading(true)
        const data = await getSavingsData(id);
        setTotalSavings(data || []);
        setLoading(false);
    };


    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                setLoading(true);
                await Promise.all([getIncomeData(), getExpenseData(), getTotalSavingsData()]);
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

            // const balance = income - expenses;
            const savings = totalSavingsData
                .filter(item => item.month == i && item.year == year)
                .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

            const balance = income - (expenses + savings);

            if (income > 0 || expenses > 0 || savings > 0) {
                groupedArray.push({
                    year,
                    month: monthNames[i - 1],
                    income,
                    expenses,
                    savings,
                    balance,
                });
            }

            // if (income > 0 || expenses > 0) {
            //     groupedArray.push({
            //         year,
            //         month: monthNames[i - 1],
            //         income,
            //         expenses,
            //         balance,
            //     });
            // }
        }
    });

    groupedArray.sort((a, b) => {
        if (a.year !== b.year) {
            return b.year - a.year;
        }
        return monthNames.indexOf(b.month) - monthNames.indexOf(a.month);
    });

    const renderHeader = () => {
        const totalIncome = groupedArray.reduce((sum, item) => sum + item.income, 0);
        const totalExpenses = groupedArray.reduce((sum, item) => sum + item.expenses, 0);
        const totalSavings = totalSavingsData.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
        const totalBalance = totalIncome - (totalExpenses+totalSavings);
        const isPositiveBalance = totalBalance >= 0;

        return (
            <View style={styles.headerMainContainer}>
                <LinearGradient colors={['#1976D2', '#42A5F5']} style={styles.headerGradient}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerTop}>
                            <ThemedText style={styles.headerTitle}>Financial Summary</ThemedText>
                            <Icon name={isPositiveBalance ? "trending-up" : "trending-down"} size={24} color="#FFF" />
                        </View>

                        {/* Cards Row */}
                        <View style={styles.cardsRow}>
                            {/* Income Card */}
                            <View style={styles.summaryCard}>
                                <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.cardGradient}>
                                    <View style={styles.cardInner}>
                                        <Icon name="arrow-upward" size={24} color="#FFF" />
                                        <ThemedText style={styles.cardLabel}>Income</ThemedText>
                                        <ThemedText style={styles.cardValue}>₹{totalIncome.toLocaleString()}</ThemedText>
                                    </View>
                                </LinearGradient>
                            </View>

                            {/* Expenses Card */}
                            <View style={styles.summaryCard}>
                                <LinearGradient colors={['#F44336', '#C62828']} style={styles.cardGradient}>
                                    <View style={styles.cardInner}>
                                        <Icon name="arrow-downward" size={24} color="#FFF" />
                                        <ThemedText style={styles.cardLabel}>Expenses</ThemedText>
                                        <ThemedText style={styles.cardValue}>₹{totalExpenses.toLocaleString()}</ThemedText>
                                    </View>
                                </LinearGradient>
                            </View>

                            {/* Savings Card */}
                            <View style={styles.summaryCard}>
                                <LinearGradient colors={['#7986CB', '#3F51B5']} style={styles.cardGradient}>
                                    <View style={styles.cardInner}>
                                        <Icon name="savings" size={24} color="#FFF" />
                                        <ThemedText style={styles.cardLabel}>Savings</ThemedText>
                                        <ThemedText style={styles.cardValue}>₹{totalSavings.toLocaleString()}</ThemedText>
                                    </View>
                                </LinearGradient>
                            </View>
                        </View>

                        {/* Balance Section */}
                        <View style={styles.balanceSection}>
                            <ThemedText style={styles.balanceLabel}>Total Available Balance</ThemedText>
                            <View style={styles.balanceRow}>
                                <Icon
                                    name="account-balance-wallet"
                                    size={28}
                                    color={isPositiveBalance ? "#A5D6A7" : "#EF9A9A"}
                                />
                                <ThemedText style={[
                                    styles.balanceAmount,
                                    { color: isPositiveBalance ? "#A5D6A7" : "#EF9A9A" }
                                ]}>
                                    ₹{Math.abs(totalBalance).toLocaleString()}
                                </ThemedText>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        );
    };

    const renderBalanceCard = ({ item }) => {
        const isPositive = item.balance >= 0;
        const savings = item.savings || 0;

        return (
            <ThemedView style={styles.cardContainer}>
                <ThemedView style={styles.card}>
                    <View style={styles.monthHeader}>
                        <ThemedText style={styles.monthYear}>{item.month} {item.year}</ThemedText>
                    </View>

                    <View style={styles.cardContent}>
                        <View style={styles.detailsContainer}>
                            <View style={styles.detailItem}>
                                <Icon name="arrow-upward" size={20} color="#4CAF50" />
                                <View style={styles.detailTextContainer}>
                                    <ThemedText style={styles.detailLabel}>Income</ThemedText>
                                    <ThemedText style={[styles.detailValue, { color: "#4CAF50" }]}>
                                        ₹{item.income.toLocaleString()}
                                    </ThemedText>
                                </View>
                            </View>

                            <View style={styles.detailItem}>
                                <Icon name="arrow-downward" size={20} color="#F44336" />
                                <View style={styles.detailTextContainer}>
                                    <ThemedText style={styles.detailLabel}>Expense</ThemedText>
                                    <ThemedText style={[styles.detailValue, { color: "#F44336" }]}>
                                        ₹{item.expenses.toLocaleString()}
                                    </ThemedText>
                                </View>
                            </View>

                            <View style={styles.detailItem}>
                                <Icon name="savings" size={20} color="#3F51B5" />
                                <View style={styles.detailTextContainer}>
                                    <ThemedText style={styles.detailLabel}>Savings</ThemedText>
                                    <ThemedText style={[styles.detailValue, { color: "#3F51B5" }]}>
                                        ₹{savings.toLocaleString()}
                                    </ThemedText>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.balanceIndicator}>
                        <Icon
                            name={isPositive ? "trending-up" : "trending-down"}
                            size={16}
                            color={isPositive ? "#4CAF50" : "#F44336"}
                        />
                        <ThemedText style={[
                            styles.balanceIndicatorText,
                            { color: isPositive ? "#4CAF50" : "#F44336" }
                        ]}>
                            Balance: ₹{Math.abs(item.balance).toLocaleString()}
                        </ThemedText>
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
        padding: 16,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 20,
        color: '#FFF',
        fontWeight: 'bold',
    },
    // New styles for the cards row
    cardsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 8,
    },
    summaryCard: {
        flex: 1,
        borderRadius: 10,
        overflow: 'hidden',
    },
    cardGradient: {
        padding: 12,
    },
    cardInner: {
        alignItems: 'center',
    },
    cardLabel: {
        fontSize: 12,
        color: '#FFF',
        opacity: 0.9,
        marginTop: 4,
    },
    cardValue: {
        fontSize: 16,
        color: '#FFF',
        fontWeight: 'bold',
        marginTop: 4,
    },
    // Balance section
    balanceSection: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 12,
    },
    balanceLabel: {
        fontSize: 14,
        color: '#FFF',
        opacity: 0.9,
        textAlign: 'center',
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    balanceAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    // Monthly card styles
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
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    card: {
        borderRadius: 12,
        padding: 0,
    },
    monthHeader: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
    },
    monthYear: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardContent: {
        padding: 12,
    },
    detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    detailItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    detailTextContainer: {
        marginLeft: 8,
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        opacity: 0.7,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    balanceIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    balanceIndicatorText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    listContainer: {
        paddingBottom: 16,
    },
});

export default BalanceList;
