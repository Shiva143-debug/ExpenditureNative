import React, { useEffect, useState, useContext } from 'react';
import { Platform, FlatList, TouchableOpacity, StyleSheet, View, Alert, PermissionsAndroid } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../AuthContext';
import ThemedView from '../components/ThemedView';
import ThemedTextInput from '../components/ThemedTextInput';
import ThemedText from '../components/ThemedText';
import LoaderSpinner from '../LoaderSpinner';
import { getFilteredExpenses } from '../services/apiService';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { ThemeContext } from '../context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const TransactionReports = () => {
    const { id } = useAuth();
    const { theme } = useContext(ThemeContext);
    const [expenceData, setExpenceData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(false);

    const [openMonth, setOpenMonth] = useState(false);
    const [openYear, setOpenYear] = useState(false);

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const [months, setMonths] = useState(
        monthNames.map((name, index) => ({ label: name, value: index + 1 }))
    );
    const yearRange = Array.from({ length: 10 }, (_, i) => currentYear - i);

    const [years, setYears] = useState(
        yearRange.map(year => ({ label: year.toString(), value: year }))
    );
    const [Month, setMonth] = useState(currentMonth);
    const [Year, setYear] = useState(currentYear);

    // Define colors based on theme
    const iconColor = theme === 'dark' ? '#FFFFFF' : '#1976D2';
    const cardBorderColor = theme === 'dark' ? '#444444' : '#E0E0E0';
    const gradientColors = theme === 'dark'
        ? ['#1A237E', '#283593']
        : ['#1976D2', '#42A5F5'];

    // Reset showFilters when navigating away and coming back
    useFocusEffect(
        React.useCallback(() => {
            setShowFilters(false);
            return () => { };
        }, [])
    );

    useEffect(() => {
        fetchExpenseData();
    }, [id, Month, Year]);

    const fetchExpenseData = async () => {
        try {
            setLoading(true);
            const data = await getFilteredExpenses(id, Month, Year);
            setExpenceData(data);
            setFilteredData(data);
            setShowFilters(false);
        } catch (error) {
            console.error('Error fetching expense data:', error);
            Alert.alert('Error', 'Failed to load expense data');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text) => {
        setSearchText(text);
        filterAll(text);
    };


    const filterAll = (search, month, year, selectedDate) => {
        const filtered = expenceData.filter(item => {
            const matchesSearch = item?.category?.toLowerCase().includes(search.toLowerCase()) ||
                item?.description?.toLowerCase().includes(search.toLowerCase()) ||
                item?.product?.toLowerCase().includes(search.toLowerCase());

            const matchesMonth = month ? parseInt(item.month) === parseInt(month) : true;
            const matchesYear = year ? parseInt(item.year) === parseInt(year) : true;
            const matchesDate = selectedDate ? item.p_date === selectedDate : true;

            return matchesSearch && matchesMonth && matchesYear && matchesDate;
        });

        setFilteredData(filtered);
    };


    const handleDownload = async () => {
        try {
            setLoading(true);

            // Sort data by category and product
            const sortedAssets = [...filteredData].sort((a, b) =>
                a.category.localeCompare(b.category) || a.product.localeCompare(b.product)
            );

            // Calculate totals
            const totalCost = sortedAssets.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0);
            const totalTaxAmount = sortedAssets.reduce((sum, item) => sum + (parseFloat(item.tax_amount) || 0), 0);

            // Group by category for better display
            const categories = {};
            sortedAssets.forEach(item => {
                if (!categories[item.category]) {
                    categories[item.category] = [];
                }
                categories[item.category].push(item);
            });

            // Generate HTML table rows
            let tableContent = '';
            Object.keys(categories).sort().forEach(category => {
                const items = categories[category];

                // Add category header
                tableContent += `
                    <tr style="background-color: #f2f2f2;">
                        <td colspan="5" style="padding: 10px; font-weight: bold; font-size: 16px; border-top: 1px solid #ddd;">
                            ${category}
                        </td>
                    </tr>
                `;

                // Add items for this category
                items.forEach(item => {
                    tableContent += `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 8px;">${item.product || 'N/A'}</td>
                            <td style="padding: 8px; text-align: right;">₹${parseFloat(item.cost || 0).toLocaleString()}</td>
                            <td style="padding: 8px; text-align: right;">₹${parseFloat(item.tax_amount || 0).toLocaleString()}</td>
                            <td style="padding: 8px;">${item.p_date || 'N/A'}</td>
                            <td style="padding: 8px;">${item.description || ''}</td>
                        </tr>
                    `;
                });
            });

            // Create HTML content
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Expense Report</title>
                    <style>
                        body { font-family: 'Helvetica'; padding: 20px; }
                        h1 { color: #16A085; text-align: center; margin-bottom: 20px; }
                        .report-header { 
                            display: flex; 
                            justify-content: space-between;
                            margin-bottom: 30px;
                            background-color: #f5f5f5;
                            padding: 15px;
                            border-radius: 5px;
                        }
                        .summary-box {
                            text-align: center;
                            padding: 10px;
                        }
                        .summary-label {
                            font-size: 14px;
                            color: #555;
                            margin-bottom: 5px;
                        }
                        .summary-value {
                            font-size: 18px;
                            font-weight: bold;
                        }
                        .expense-value { color: #E74C3C; }
                        .tax-value { color: #F39C12; }
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-top: 20px;
                        }
                        th { 
                            background-color: #16A085; 
                            color: white; 
                            padding: 10px; 
                            text-align: left;
                        }
                        .footer {
                            margin-top: 30px;
                            text-align: center;
                            font-size: 12px;
                            color: #777;
                        }
                    </style>
                </head>
                <body>
                    <h1>${monthNames[Month - 1]} ${Year} Expense Report</h1>
                    
                    <div class="report-header">
                        <div class="summary-box">
                            <div class="summary-label">Total Expenses</div>
                            <div class="summary-value expense-value">₹${totalCost.toLocaleString()}</div>
                        </div>
                        <div class="summary-box">
                            <div class="summary-label">Total Tax Amount</div>
                            <div class="summary-value tax-value">₹${totalTaxAmount.toLocaleString()}</div>
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 25%;">Product</th>
                                <th style="width: 15%; text-align: right;">Cost</th>
                                <th style="width: 15%; text-align: right;">Tax Amount</th>
                                <th style="width: 15%;">Date</th>
                                <th style="width: 30%;">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableContent}
                        </tbody>
                    </table>
                    
                    <div class="footer">
                        Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
                    </div>
                </body>
                </html>
            `;

            // Generate the PDF
            const options = {
                html: htmlContent,
                fileName: `Expense_Report_${monthNames[Month - 1]}_${Year}`,
                directory: 'Documents',
                base64: false
            };

            try {
                const file = await RNHTMLtoPDF.convert(options);
                console.log('PDF generated successfully:', file);

                // Share the PDF
                if (file && file.filePath) {
                    const shareOptions = {
                        title: 'Share Expense Report',
                        message: `${monthNames[Month - 1]} ${Year} Expense Report`,
                        url: `file://${file.filePath}`,
                        type: 'application/pdf',
                    };

                    await Share.open(shareOptions);
                    Alert.alert('Success', 'Expense report generated successfully');
                } else {
                    throw new Error('PDF file path is undefined');
                }
            } catch (pdfError) {
                console.error('PDF generation error:', pdfError);
                Alert.alert('Error', 'Failed to generate PDF: ' + pdfError.message);
            }

        } catch (error) {
            console.error('Error in handleDownload function:', error);
            Alert.alert('Error', 'Failed to generate expense report: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderHeader = () => {
        return (
            <ThemedView style={styles.headerContainer}>
                {!showFilters ? (
                    <LinearGradient colors={gradientColors} style={styles.headerGradient}>
                        <View style={styles.topRow}>
                            <ThemedTextInput style={styles.searchBar} placeholder="Search by category, product, or description" placeholderTextColor={theme === 'dark' ? '#AAAAAA' : '#666666'} value={searchText} onChangeText={handleSearch} />
                            <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.iconButton}>
                                <Icon name="filter-list" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDownload} style={styles.iconButton}>
                                <Icon name="file-download" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.currentPeriod}>
                            <Icon name="event" size={18} color="#FFFFFF" />
                            <ThemedText style={styles.periodText}>{monthNames[Month - 1]} {Year}
                            </ThemedText>
                        </View>
                    </LinearGradient>
                ) : (
                    <ThemedView style={styles.filterContainer}>
                        <View style={styles.filterHeader}>
                            <ThemedText style={styles.filterTitle}>Select Period</ThemedText>
                            <TouchableOpacity onPress={() => setShowFilters(false)} style={styles.closeButton}>
                                <Icon name="close" size={24} color={iconColor} />
                            </TouchableOpacity>
                        </View>

                        <ThemedView style={styles.dropdownsContainer}>
                            <ThemedView style={styles.dropdownBox}>
                                <ThemedText style={styles.dropdownLabel}>Month</ThemedText>
                                <DropDownPicker open={openMonth} value={Month} items={months} setValue={setMonth} setItems={setMonths} placeholder="Select Month"
                                    style={styles.picker}
                                    dropDownContainerStyle={styles.dropdownList} textStyle={styles.dropdownText} listMode="SCROLLVIEW"
                                    setOpen={(isOpen) => {
                                        setOpenMonth(isOpen);
                                        if (isOpen) setOpenYear(false);
                                    }}
                                    theme={theme === 'dark' ? 'DARK' : 'LIGHT'}
                                />
                            </ThemedView>

                            <ThemedView style={styles.dropdownBox}>
                                <ThemedText style={styles.dropdownLabel}>Year</ThemedText>
                                <DropDownPicker open={openYear} value={Year} items={years} setValue={setYear} setItems={setYears} placeholder="Select Year"
                                    style={styles.picker}
                                    dropDownContainerStyle={styles.dropdownList} textStyle={styles.dropdownText} listMode="SCROLLVIEW"
                                    setOpen={(isOpen) => {
                                        setOpenYear(isOpen);
                                        if (isOpen) setOpenMonth(false);
                                    }}
                                    theme={theme === 'dark' ? 'DARK' : 'LIGHT'}
                                />
                            </ThemedView>
                        </ThemedView>

                    </ThemedView>
                )}
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.headerSection}>
                {renderHeader()}
            </View>

            {loading ? (
                <LoaderSpinner />
            ) : (
                <View style={styles.contentContainer}>
                    <ThemedView style={styles.reportHeader}>
                        <ThemedText style={styles.reportTitle}>
                            {monthNames[Month - 1]} {Year} Expense Report
                        </ThemedText>
                        <ThemedText style={styles.reportSubtitle}>
                            {filteredData.length} transactions found
                        </ThemedText>
                    </ThemedView>

                    <FlatList
                        data={filteredData}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={() => (
                            <ThemedView style={styles.noDataContainer}>
                                <Icon name="receipt-long" size={48} color={iconColor} style={styles.noDataIcon} />
                                <ThemedText style={styles.noDataText}>No expenses found</ThemedText>
                                <ThemedText style={styles.noDataSubtext}>
                                    Try changing filters or adding new expenses
                                </ThemedText>
                            </ThemedView>
                        )}
                        renderItem={({ item }) => (
                            <ThemedView style={[styles.card, { borderColor: cardBorderColor }]}>
                                <View style={styles.cardHeader}>
                                    <ThemedText style={styles.productName} numberOfLines={1}>
                                        {item.product}
                                    </ThemedText>
                                    <ThemedText style={styles.costAmount}>
                                        ₹{parseFloat(item.cost).toLocaleString()}
                                    </ThemedText>
                                </View>

                                <View style={styles.cardDetails}>
                                    <View style={styles.detailRow}>
                                        <Icon name="category" size={16} color={iconColor} style={styles.detailIcon} />
                                        <ThemedText style={styles.detailText} numberOfLines={1}>
                                            {item.category}
                                        </ThemedText>
                                    </View>

                                    {item.tax_amount > 0 && (
                                        <View style={styles.detailRow}>
                                            <Icon name="receipt" size={16} color={iconColor} style={styles.detailIcon} />
                                            <ThemedText style={styles.detailText}>
                                                Tax: ₹{parseFloat(item.tax_amount).toLocaleString()}
                                            </ThemedText>
                                        </View>
                                    )}

                                    <View style={styles.detailRow}>
                                        <Icon name="event" size={16} color={iconColor} style={styles.detailIcon} />
                                        <ThemedText style={styles.detailText}>
                                            {item.p_date}
                                        </ThemedText>
                                    </View>

                                    {item.description && (
                                        <View style={styles.detailRow}>
                                            <Icon name="description" size={16} color={iconColor} style={styles.detailIcon} />
                                            <ThemedText style={styles.detailText} numberOfLines={2}>
                                                {item.description}
                                            </ThemedText>
                                        </View>
                                    )}
                                </View>
                            </ThemedView>
                        )}
                    />
                </View>
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerSection: {
        // paddingTop: 5,
        zIndex: 1,
        height: 100,
        marginBottom: 5,
    },
    headerContainer: {
        width: '100%',
    },
    headerGradient: {
        padding: 10,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchBar: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 8,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#FFFFFF',
    },
    iconButton: {
        marginLeft: 12,
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
    },
    currentPeriod: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    periodText: {
        color: '#FFFFFF',
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    filterContainer: {
        padding: 16,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    filterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    filterTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    dropdownLabel: {
        marginBottom: 8,
        fontSize: 14,
    },
    dropdownText: {
        fontSize: 16,
    },
    dropdownsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 12,
    },
    dropdownBox: {
        flex: 1,
        zIndex: 1000,
    },
    picker: {
        borderColor: '#ccc',
        borderRadius: 8,
        height: 45,
        backgroundColor: "transparent"
    },
    dropdownList: {
       borderColor: '#ccc',
        maxHeight: 800,
    },
    applyButton: {
        borderRadius: 8,
        overflow: 'hidden',
        marginTop: 8,
    },
    applyGradient: {
        padding: 12,
        alignItems: 'center',
    },
    applyText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    contentContainer: {
        flex: 1,
        padding: 10,
        paddingTop: 50,
    },
    reportHeader: {
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    reportTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    reportSubtitle: {
        fontSize: 14,
        opacity: 0.7,
        // paddingTop:500
    },
    listContainer: {
        paddingBottom: 16,
    },
    card: {
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        borderWidth: 1,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
    },
    costAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardDetails: {
        padding: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailIcon: {
        marginRight: 8,
    },
    detailText: {
        fontSize: 14,
        flex: 1,
    },
    noDataContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noDataIcon: {
        marginBottom: 16,
        opacity: 0.6,
    },
    noDataText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    noDataSubtext: {
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.7,
    },
});

export default TransactionReports;
