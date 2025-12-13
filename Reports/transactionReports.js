import React, { useEffect, useState, useContext, useMemo, useRef } from 'react';
import { FlatList, TouchableOpacity, StyleSheet, View, Alert, Animated, Platform } from 'react-native';
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
import RNFS from 'react-native-fs';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { ThemeContext } from '../context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const TransactionCard = ({ item, index, palette }) => {
    const translateY = useRef(new Animated.Value(24)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: 500,
                delay: index * 60,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 500,
                delay: index * 60,
                useNativeDriver: true,
            }),
        ]).start();
    }, [index, opacity, translateY]);

    const gradient = palette.cardGradients[index % palette.cardGradients.length];

    return (
        <Animated.View style={[styles.transactionCardWrapper, { opacity, transform: [{ translateY }] }]}>
            <LinearGradient colors={gradient} style={[styles.transactionCard, { borderColor: palette.cardBorder }]}>
                <View style={styles.transactionHeader}>
                    <View style={styles.categoryDateRow}>
                        <View style={[styles.transactionChip, { backgroundColor: palette.chipBackground }]}>
                            <Icon name="category" size={16} color={palette.chipText} />
                            <ThemedText style={[styles.transactionChipText, { color: palette.chipText }]} numberOfLines={1}>
                                {item.category || 'Uncategorized'}
                            </ThemedText>
                        </View>
                        <ThemedText style={[styles.transactionDate, { color: '#ffffff' }]}>
                            {item.p_date || '—'}
                        </ThemedText>
                    </View>
                    <View style={styles.productCostRow}>
                        <ThemedText style={[styles.transactionProduct, { color: palette.textPrimary }]} numberOfLines={1}>
                            {item.product || 'Unnamed purchase'}
                        </ThemedText>
                        <ThemedText style={[styles.transactionAmount, { color: palette.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">
                            ₹{(parseFloat(item.cost) || 0).toLocaleString('en-IN')}
                        </ThemedText>
                    </View>
                </View>
                <View style={[styles.transactionBody, { borderColor: palette.cardBorder }]}>
                    {parseFloat(item.tax_amount) > 0 && (
                        <View style={styles.transactionDetailRow}>
                            <Icon name="receipt-long" size={16} color={palette.textSecondary} style={styles.transactionDetailIcon} />
                            <ThemedText style={[styles.transactionDetailText, { color: palette.textSecondary }]}>
                                Tax ₹{(parseFloat(item.tax_amount) || 0).toLocaleString('en-IN')}
                            </ThemedText>
                        </View>
                    )}
                    {item.description ? (
                        <View style={styles.transactionDetailRow}>
                            <Icon name="description" size={16} color={palette.textSecondary} style={styles.transactionDetailIcon} />
                            <ThemedText style={[styles.transactionDetailText, { color: palette.textSecondary }]} numberOfLines={2}>
                                {item.description}
                            </ThemedText>
                        </View>
                    ) : null}
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

const TransactionReports = () => {
    const { id } = useAuth();
    const { theme } = useContext(ThemeContext);
    const [expenceData, setExpenceData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [debouncedSearchText, setDebouncedSearchText] = useState('');
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

    const palette = useMemo(() => theme === 'dark'
        ? {
            background: '#0f172a',
            headerGradient: ['#0f172a', '#1e293b'],
            headerAccent: '#38bdf8',
            searchBackground: 'rgba(148, 163, 184, 0.16)',
            searchBorder: 'rgba(148, 163, 184, 0.28)',
            searchPlaceholder: '#94a3b8',
            iconColor: '#38bdf8',
            summaryGradients: [
                ['#f97316', '#fb7185'],
                ['#22d3ee', '#0284c7'],
                ['#34d399', '#059669'],
                ['#a855f7', '#6366f1'],
            ],
            summaryText: '#f8fafc',
            cardGradients: [
                ['#1f2937', '#111827'],
                ['#1e293b', '#0f172a'],
                ['#1d4ed8', '#1e293b'],
                ['#0f172a', '#0b1120'],
            ],
            cardBorder: 'rgba(148, 163, 184, 0.16)',
            textPrimary: '#e2e8f0',
            textSecondary: '#94a3b8',
            chipBackground: 'rgba(56, 189, 248, 0.12)',
            chipText: '#bae6fd',
            downloadGradient: ['#38bdf8', '#0ea5e9'],
            emptyIcon: '#38bdf8',
        }
        : {
            background: '#f5f7fb',
            headerGradient: ['#2563eb', '#7c3aed'],
            headerAccent: '#1d4ed8',
            searchBackground: 'rgba(255, 255, 255, 0.95)',
            searchBorder: 'rgba(59, 130, 246, 0.2)',
            searchPlaceholder: '#64748b',
            iconColor: '#2563eb',
            summaryGradients: [
                ['#f97316', '#fb923c'],
                ['#0ea5e9', '#38bdf8'],
                ['#22c55e', '#4ade80'],
                ['#6366f1', '#8b5cf6'],
            ],
            summaryText: '#ffffff',
            cardGradients: [
                ['#ffffff', '#f8fafc'],
                ['#fff7ed', '#ffedd5'],
                ['#ecfeff', '#cffafe'],
                ['#ede9fe', '#ddd6fe'],
            ],
            cardBorder: 'rgba(15, 23, 42, 0.08)',
            textPrimary: '#0f172a',
            textSecondary: '#475569',
            chipBackground: 'rgba(99, 102, 241, 0.12)',
            chipText: '#4338ca',
            downloadGradient: ['#2563eb', '#7c3aed'],
            emptyIcon: '#2563eb',
        }
    );

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

    // Debounce search text
    useEffect(() => {
        if (searchText === '') {
            setDebouncedSearchText('');
        } else {
            const timeout = setTimeout(() => {
                setDebouncedSearchText(searchText);
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [searchText]);

    const fetchExpenseData = async () => {
        try {
            setLoading(true);
            const data = await getFilteredExpenses(id, Month, Year);
            setExpenceData(data);
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
    };

    const filteredData = useMemo(() => {
        if (!debouncedSearchText) return expenceData;
        return expenceData.filter(item => {
            const matchesSearch = item?.category?.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
                item?.description?.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
                item?.product?.toLowerCase().includes(debouncedSearchText.toLowerCase());
            return matchesSearch;
        });
    }, [debouncedSearchText, expenceData]);


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

                if (file && file.filePath) {
                    const fileName = `Expense_Report_${monthNames[Month - 1]}_${Year}.pdf`;

                    try {
                        // Try to save directly to Downloads folder
                        const downloadPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
                        await RNFS.copyFile(file.filePath, downloadPath);
                        console.log('PDF saved to:', downloadPath);
                        Alert.alert('Success', `Expense report saved to Downloads as ${fileName}`);
                    } catch (copyError) {
                        console.warn('Direct save failed, using share:', copyError);

                        // Fallback: Use Share to save the PDF
                        const shareOptions = {
                            title: 'Save Expense Report',
                            url: `file://${file.filePath}`,
                            type: 'application/pdf',
                            filename: fileName,
                        };

                        await Share.open(shareOptions);
                        Alert.alert('Success', 'PDF generated. Choose "Save to Downloads" or your preferred location.');
                    }
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

    const renderHeader = () => (
        <ThemedView style={styles.headerContainer}>
            {!showFilters ? (
                <LinearGradient colors={palette.headerGradient} style={styles.headerGradient}>
                    <View style={styles.headerTopRow}>
                        <View>
                            <ThemedText style={styles.headerTitle}>Expense Reports</ThemedText>
                            <ThemedText style={styles.headerSubtitle}>{monthNames[Month - 1]} {Year}</ThemedText>
                        </View>
                        <View style={styles.headerActions}>
                            <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.headerIconButton}>
                                <Icon name="tune" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDownload} style={styles.headerIconButton}>
                                <Icon name="file-download" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
                        <View>
                            <ThemedText style={[styles.summaryLabel, { color: palette.summaryText }]}>Total Expenses</ThemedText>
                            <ThemedText style={[styles.summaryValue, { color: palette.summaryText }]}>₹{filteredData.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0).toLocaleString('en-IN')}</ThemedText>
                        </View>

                        <View>
                            <ThemedText style={[styles.summaryLabel, { color: palette.summaryText }]}>Entries</ThemedText>
                            <ThemedText style={[styles.summaryValue, { color: palette.summaryText }]}>{filteredData.length}</ThemedText>
                        </View>
                    </View>


                    <View style={[styles.searchContainer, { backgroundColor: palette.searchBackground, borderColor: palette.searchBorder }]}>
                        <Icon name="search" size={18} color={palette.searchPlaceholder} style={styles.searchIcon} />
                        <ThemedTextInput
                            style={[styles.searchInput, { color: palette.textPrimary }]}
                            placeholder="Search by category, product, or description"
                            placeholderTextColor={palette.searchPlaceholder}
                            value={searchText}
                            onChangeText={handleSearch}
                        />
                    </View>
                </LinearGradient>
            ) : (
                <ThemedView style={[styles.filterContainer, { backgroundColor: palette.searchBackground, borderColor: palette.cardBorder }]}>
                    <View style={styles.filterHeader}>
                        <ThemedText style={[styles.filterTitle, { color: palette.textPrimary }]}>Select Period</ThemedText>
                        <TouchableOpacity onPress={() => setShowFilters(false)} style={styles.closeButton}>
                            <Icon name="close" size={20} color={palette.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.dropdownsContainer}>
                        <View style={[styles.dropdownBox, styles.dropdownBoxSpacing]}>
                            <ThemedText style={[styles.dropdownLabel, { color: palette.textSecondary }]}>Month</ThemedText>
                            <DropDownPicker
                                open={openMonth}
                                value={Month}
                                items={months}
                                setValue={setMonth}
                                setItems={setMonths}
                                placeholder="Select Month"
                                style={[styles.picker, { borderColor: palette.cardBorder, backgroundColor: palette.background }]}
                                dropDownContainerStyle={[styles.dropdownList, { borderColor: palette.cardBorder, backgroundColor: palette.background }]}
                                textStyle={[styles.dropdownText, { color: palette.textPrimary }]}
                                listMode="SCROLLVIEW"
                                setOpen={(isOpen) => {
                                    setOpenMonth(isOpen);
                                    if (isOpen) setOpenYear(false);
                                }}
                                theme={theme === 'dark' ? 'DARK' : 'LIGHT'}
                            />
                        </View>

                        <View style={styles.dropdownBox}>
                            <ThemedText style={[styles.dropdownLabel, { color: palette.textSecondary }]}>Year</ThemedText>
                            <DropDownPicker
                                open={openYear}
                                value={Year}
                                items={years}
                                setValue={setYear}
                                setItems={setYears}
                                placeholder="Select Year"
                                style={[styles.picker, { borderColor: palette.cardBorder, backgroundColor: palette.background }]}
                                dropDownContainerStyle={[styles.dropdownList, { borderColor: palette.cardBorder, backgroundColor: palette.background }]}
                                textStyle={[styles.dropdownText, { color: palette.textPrimary }]}
                                listMode="SCROLLVIEW"
                                setOpen={(isOpen) => {
                                    setOpenYear(isOpen);
                                    if (isOpen) setOpenMonth(false);
                                }}
                                theme={theme === 'dark' ? 'DARK' : 'LIGHT'}
                            />
                        </View>
                    </View>
                </ThemedView>
            )}
        </ThemedView>
    );

    return (
        <ThemedView style={[styles.container, { backgroundColor: palette.background }]}>
            <LoaderSpinner shouldLoad={loading} />
            
            <FlatList
                ListHeaderComponent={renderHeader}
                stickyHeaderIndices={[0]}
                data={filteredData}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={<View style={styles.listFooterSpacing} />}
                ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                        <Icon name="receipt-long" size={48} color={palette.emptyIcon} />
                        <ThemedText style={[styles.emptyTitle, { color: palette.textPrimary }]}>No expenses found</ThemedText>
                        <ThemedText style={[styles.emptySubtitle, { color: palette.textSecondary }]}>
                            Adjust your filters or try a different period to see results.
                        </ThemedText>
                    </View>
                )}
                renderItem={({ item, index }) => (
                    <TransactionCard item={item} index={index} palette={palette} />
                )}
            />
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerSection: {
        paddingHorizontal: 2,
        paddingTop: 12,
        paddingBottom: 16,

    },
    headerContainer: {
        width: '100%',
        paddingHorizontal: 2,
        paddingTop: 2,
        marginBottom:20
    },
    headerGradient: {
        borderRadius: 22,
        padding: 24,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.75)',
        marginTop: 4,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        marginLeft: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18,
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        borderRadius: 18,
        padding: 18,
    },
    summaryCardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 6,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: '700',
    },
    summaryActionButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 12,
        height: 46,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        height: 46,
        backgroundColor: 'transparent',
    },
    filterContainer: {
        borderWidth: 1,
        borderRadius: 18,
        padding: 20,
    },
    filterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    filterTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownsContainer: {
        flexDirection: 'row',
        marginTop: 8,
    },
    dropdownBox: {
        flex: 1,
    },
    dropdownBoxSpacing: {
        marginRight: 12,
    },
    dropdownLabel: {
        fontSize: 13,
        marginBottom: 8,
    },
    dropdownText: {
        fontSize: 15,
    },
    picker: {
        borderWidth: 1,
        borderRadius: 12,
        height: 48,
    },
    dropdownList: {
        borderWidth: 1,
        borderRadius: 12,
        maxHeight: 600,
    },
    summaryGrid: {
        paddingHorizontal: 16,
        marginTop: 24,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    summaryCardWrapper: {
        width: '48%',
        marginBottom: 16,
    },
    summaryCard: {
        borderRadius: 20,
        padding: 18,
    },
    summaryCardContent: {
        flexDirection: 'column',
    },
    summaryIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        marginBottom: 14,
    },
    summaryTextGroup: {
    },
    summaryLabel: {
        fontSize: 13,
        fontWeight: '600',

    },
    summaryValue: {
        fontSize: 22,
        fontWeight: '700',
        marginTop: 4,
    },
    summaryDescription: {
        fontSize: 11,
        marginTop: 6,
        opacity: 0.85,
    },
    listHeader: {
        paddingBottom: 16,
    },
    reportHeader: {
        marginHorizontal: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderRadius: 20,
        padding: 16,
    },
    reportHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reportTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    reportSubtitle: {
        fontSize: 13,
        marginTop: 4,
    },
    reportHeaderIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        paddingBottom: 32,
        paddingHorizontal: 10,
    },
    listFooterSpacing: {
        height: 24,
    },
    emptyState: {
        paddingVertical: 80,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 13,
        marginTop: 6,
        textAlign: 'center',
    },
    transactionCardWrapper: {
        paddingHorizontal: 6,
        marginBottom: 16,
    },
    transactionCard: {
        borderRadius: 22,
        padding: 18,
        borderWidth: 1,
    },
    transactionHeader: {
    },
    categoryDateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    productCostRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    transactionTitleRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 12,
    },
    transactionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    transactionChipText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
        maxWidth: 150,
    },
    transactionAmount: {
        fontSize: 20,
        fontWeight: '700',
        maxWidth: 120,
        flexShrink: 1,
    },
    transactionProduct: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    transactionBody: {
        marginTop: 16,
        borderTopWidth: 1,
        paddingTop: 12,
    },
    transactionDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    transactionDetailIcon: {
        marginRight: 8,
    },
    transactionDate: {
        fontSize: 13,
        color: 'inherit',
    },
    transactionDetailText: {
        fontSize: 13,
        flex: 1,
    },
});

export default TransactionReports;
