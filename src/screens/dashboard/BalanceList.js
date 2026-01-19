import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import LoaderSpinner from '../../components/LoaderSpinner';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import { useAuth } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { getTotalIncomeData ,getExpenseCosts, getSavingsData} from '../../services/apiService';


const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


const detailsPalette = {
    light: {
        header: '#f1f5f9',
        background: '#f8fafc',
        accent: '#ea580c',
        accentSoft: '#fed7aa',
        surface: '#ffffff',
        cardShadow: '#e2e8f01a',
        iconGlow: 'rgba(249, 115, 22, 0.35)',
        emptyIcon: '#64748b',
        cardBackground: '#ffffff',
        cardAccent: '#334155',
    },
    dark: {
        header: 'rgba(35, 35, 35, 0.19)',
        background: '#000000',
        accent: '#ea580c',
        accentSoft: '#fed7aa',
        surface: '#000000',
        cardShadow: '#e0d9d955',
        iconGlow: 'rgba(249, 115, 22, 0.35)',
        emptyIcon: '#475569',
        cardBackground: 'rgba(255, 255, 255, 0.1)',
        cardAccent: '#e2e8f0',
    },
};

const AnimatedCard = ({ children, index, style }) => {
    const animatedValue = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.spring(animatedValue, {
            toValue: 1,
            tension: 20,
            friction: 7,
            delay: index * 100,
            useNativeDriver: true,
        }).start();
    }, [index]);

    const translateY = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [50, 0],
    });

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    return (
        <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
            {children}
        </Animated.View>
    );
};

const BalanceList = () => {
    const { id } = useAuth();
    const [totalIncomeData, setTotalIncome] = useState([]);
    const [totalCostData, setExpenseCost] = useState([]);
    const [totalSavingsData, setTotalSavings] = useState([]);
    const [loading, setLoading] = useState(false);
    const { theme } = useContext(ThemeContext);
    const palette = theme === 'dark' ? detailsPalette.dark : detailsPalette.light;

    const getIncomeData = async () => {
        try {
            const data = await getTotalIncomeData(id);
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
        const totalBalance = totalIncome - (totalExpenses + totalSavings);
        const isPositiveBalance = totalBalance >= 0;

        return (
            <View style={styles.headerContainer}>
                <LinearGradient
                    colors={['#0F2027', '#203A43', '#2C5364']}
                    style={styles.mainGradient}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.headerTop}>
                            <View>
                                <ThemedText style={styles.subHeaderText}>Financial Overview</ThemedText>
                                {/* <ThemedText style={styles.subHeaderText}>Current Status</ThemedText> */}
                            </View>
                            <View style={styles.iconContainer}>
                                <Icon name="analytics" size={28} color="#42A5F5" />
                            </View>
                        </View>

                        <View style={styles.totalBalanceContainer}>
                            <ThemedText style={styles.totalBalanceLabel}>Total Net Balance</ThemedText>
                            <ThemedText style={[
                                styles.totalBalanceAmount,
                                { color: isPositiveBalance ? '#66BB6A' : '#EF5350' }
                            ]}>
                                ₹{totalBalance.toLocaleString()}
                            </ThemedText>
                        </View>

                        <View style={styles.summaryGrid}>
                            <View style={styles.summaryItem}>
                                <View style={[styles.indicator, { backgroundColor: '#4CAF50' }]} />
                                <ThemedText style={styles.summaryLabel}>Income</ThemedText>
                                <ThemedText style={styles.summaryValue}>₹{totalIncome.toLocaleString()}</ThemedText>
                            </View>
                            <View style={styles.summaryItem}>
                                <View style={[styles.indicator, { backgroundColor: '#F44336' }]} />
                                <ThemedText style={styles.summaryLabel}>Expenses</ThemedText>
                                <ThemedText style={styles.summaryValue}>₹{totalExpenses.toLocaleString()}</ThemedText>
                            </View>
                            <View style={styles.summaryItem}>
                                <View style={[styles.indicator, { backgroundColor: '#42A5F5' }]} />
                                <ThemedText style={styles.summaryLabel}>Savings</ThemedText>
                                <ThemedText style={styles.summaryValue}>₹{totalSavings.toLocaleString()}</ThemedText>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        );
    };

    const renderBalanceCard = ({ item, index }) => {
        const isPositive = item.balance >= 0;
        const savings = item.savings || 0;

        return (
            <AnimatedCard
                index={index}
                style={styles.cardContainer}
            >
                <LinearGradient
                    colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.futuristicCard}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.monthBadge}>
                            <ThemedText style={styles.monthText}>{item.month}</ThemedText>
                        </View>
                        <ThemedText style={styles.yearText}>{item.year}</ThemedText>
                        <View style={[styles.statusGlow, { backgroundColor: isPositive ? '#4CAF50' : '#F44336' }]} />
                    </View>

                    <View style={styles.statsGrid}>
                        <View style={styles.statBox}>
                            <ThemedText style={styles.statLabel}>Income</ThemedText>
                            <ThemedText style={[styles.statValue, { color: '#4CAF50' }]}>₹{item.income.toLocaleString()}</ThemedText>
                        </View>
                        <View style={styles.statBox}>
                            <View style={styles.statDivider} />
                            <ThemedText style={styles.statLabel}>Expense</ThemedText>
                            <ThemedText style={[styles.statValue, { color: '#F44336' }]}>₹{item.expenses.toLocaleString()}</ThemedText>
                        </View>
                        <View style={styles.statBox}>
                            <View style={styles.statDivider} />
                            <ThemedText style={styles.statLabel}>Savings</ThemedText>
                            <ThemedText style={[styles.statValue, { color: '#42A5F5' }]}>₹{savings.toLocaleString()}</ThemedText>
                        </View>
                    </View>

                    <View style={styles.balanceFooter}>
                        <View style={styles.balanceLine} />
                        <View style={styles.balanceContent}>
                            <ThemedText style={styles.balanceFooterLabel}>Net Balance</ThemedText>
                            <ThemedText style={[styles.balanceFooterValue, { color: isPositive ? '#81C784' : '#E57373' }]}>
                                {isPositive ? '+' : '-'}₹{Math.abs(item.balance).toLocaleString()}
                            </ThemedText>
                        </View>
                    </View>
                </LinearGradient>
            </AnimatedCard>
        );
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: palette.background }]}>
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
    headerContainer: {
        marginBottom: 20,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    mainGradient: {
        padding: 24,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    welcomeText: {
        fontSize: 14,
        opacity: 0.7,
        fontWeight: '600',
        color: '#FFF',
    },
    subHeaderText: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: 0.5,
    },
    iconContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 10,
        borderRadius: 14,
    },
    totalBalanceContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    totalBalanceLabel: {
        fontSize: 14,
        opacity: 0.7,
        color: '#FFF',
        marginBottom: 8,
    },
    totalBalanceAmount: {
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: 1,
    },
    summaryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        padding: 16,
        borderRadius: 18,
    },
    summaryItem: {
        alignItems: 'center',
    },
    indicator: {
        width: 12,
        height: 4,
        borderRadius: 2,
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 11,
        opacity: 0.6,
        color: '#FFF',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFF',
    },
    // Futuristic monthly card styles
    cardContainer: {
        marginBottom: 16,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'gray',
        backgroundColor: 'transparent',
    },
    futuristicCard: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    monthBadge: {
        backgroundColor: '#1976D2',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 10,
    },
    monthText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    yearText: {
        fontSize: 16,
        fontWeight: '600',
        opacity: 0.8,
        flex: 1,
    },
    statusGlow: {
        width: 8,
        height: 8,
        borderRadius: 4,
        elevation: 5,
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        position: 'relative',
    },
    statDivider: {
        position: 'absolute',
        left: 0,
        top: '20%',
        bottom: '20%',
        width: 1,
        backgroundColor: 'gray',
    },
    statLabel: {
        fontSize: 11,
        opacity: 0.6,
        marginBottom: 4,
        fontWeight: '500',
    },
    statValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    balanceFooter: {
        marginTop: 8,
    },
    balanceLine: {
        height: 1,
        backgroundColor: 'gray',
        width: '100%',
        marginBottom: 12,
    },
    balanceContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    balanceFooterLabel: {
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.8,
    },
    balanceFooterValue: {
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    listContainer: {
        paddingBottom: 16,
    },
});

export default BalanceList;
