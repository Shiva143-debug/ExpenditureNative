import React, { useEffect, useState } from 'react';
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

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const TransactionReports = () => {
    const { id } = useAuth();
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


    useEffect(() => {
        fetchExpenseData();
    }, [id, Month, Year])

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

    const renderHeader = () => (
        <ThemedView style={styles.headerContainer}>
            {!showFilters && (
                <ThemedView style={styles.topRow}>
                    <ThemedTextInput style={styles.searchBar} placeholder="Search by category, product, or description"
                        value={searchText} onChangeText={handleSearch}
                    />
                    <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={styles.iconButton}>
                        <Icon name="filter-list" size={24} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDownload} style={styles.iconButton}>
                        <Icon name="file-download" size={24} color="#333" />
                    </TouchableOpacity>
                </ThemedView>
            )}

            {showFilters && (
                <ThemedView style={styles.filterContainer}>
                    <ThemedView style={styles.dropdownsContainer}>
                        <ThemedView style={styles.dropdownBox}>
                            <DropDownPicker open={openMonth} value={Month} items={months} setValue={setMonth}
                                setItems={setMonths} placeholder="Select Month" style={styles.picker} dropDownContainerStyle={styles.dropdownList} listMode="SCROLLVIEW"
                                setOpen={(isOpen) => {
                                    setOpenMonth(isOpen);
                                    if (isOpen) setOpenYear(false);
                                }}
                            />
                        </ThemedView>

                        <ThemedView style={styles.dropdownBox}>
                            <DropDownPicker open={openYear} value={Year} items={years}
                                setValue={setYear} setItems={setYears} placeholder="Select Year" style={styles.picker} dropDownContainerStyle={styles.dropdownList}
                                listMode="SCROLLVIEW" setOpen={(isOpen) => {
                                    setOpenYear(isOpen);
                                    if (isOpen) setOpenMonth(false);
                                }}
                            />
                        </ThemedView>
                    </ThemedView>


                </ThemedView>
            )}
        </ThemedView>
    )

    return (
        <ThemedView style={styles.container}>
            <View style={styles.headerSection}>
                {renderHeader()}
            </View>
            {loading ? (
                <LoaderSpinner />
            ) : (
                <View>
                    <ThemedText style={[styles.title, { textAlign: "center", borderWidth: 2, borderBottomColor: "gray", marginBottom: 5 }]}>{monthNames[Month - 1]} - {Year} Reports</ThemedText>

                    <FlatList data={filteredData} keyExtractor={(item, index) => index.toString()}
                        ListEmptyComponent={() => (
                            <ThemedView style={styles.noDataContainer}>
                                <ThemedText style={styles.noDataText}>No expenses found</ThemedText>
                            </ThemedView>
                        )}
                        renderItem={({ item }) => (
                            <ThemedView style={styles.card}>
                                <ThemedText style={styles.title}>Expence Name:{item.product}</ThemedText>
                                <View style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                    <ThemedText style={styles.subtitle}>Category:{item.category}</ThemedText>
                                    <ThemedText style={styles.subtitle}>₹ {item.cost}</ThemedText>
                                </View>
                                <View style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                    <ThemedText style={styles.subtitle}>{item.p_date}</ThemedText>
                                    <Icon name="arrow-forward-ios" size={14} color="gray" />
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
    container: { flex: 1, },
    headerSection: { paddingTop: 5, zIndex: 1, height: 80, },
    headerContainer: { width: '100%', },
    topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 5, },
    searchBar: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 5,
    },
    iconButton: {
        marginLeft: 10,
        padding: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 6,
    },
    filterContainer: {
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2,
    },
    dropdownsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dropdownBox: {
        flex: 1,
        marginRight: 5,
        zIndex: 1000,
    },
    picker: {
        borderWidth: 0,
        borderRadius: 8,
    },
    dropdownList: {
        borderWidth: 0,
        borderRadius: 8,
        maxHeight: 800
    },
    applyBtn: {
        backgroundColor: '#2196F3',
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
        height: 50
    },
    applyText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    card: {
        paddingHorizontal: 12,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 1,
        borderWidth: 2,
        borderBottomColor: "gray"
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingBottom: 5
    },
    subtitle: {
        fontSize: 14,
        paddingBottom: 10
    },
    noDataContainer: {
        padding: 20,
        alignItems: 'center',
    },
    noDataText: {
        fontSize: 16,
        color: '#999',
        fontStyle: 'italic',
    },
});

export default TransactionReports;




{/* <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <ThemedText style={styles.dateButtonText}>
          {date ? `Selected Date: ${date}` : 'Pick a Date'}
        </ThemedText>
      </TouchableOpacity> */}

{/* {showDatePicker && (
        <DateTimePicker
          value={date ? new Date(date) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )} */}

// const handleMonthSelect = (val) => {