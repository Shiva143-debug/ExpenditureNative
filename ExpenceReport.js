import * as React from 'react';
import { DataTable, } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { useEffect, useState } from "react";
import { Picker } from '@react-native-picker/picker';



const ExpenceReport = () => {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = Array.from({ length: 20 }, (_, i) => 2000 + i);

    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [page, setPage] = React.useState(0);
    const [numberOfItemsPerPageList] = React.useState([2, 3, 4, 8]);
    const [itemsPerPage, onItemsPerPageChange] = React.useState(8);
    const [items, setExpenceData] = React.useState([])

    useEffect(() => {
        const userId = 1;
        fetch(`https://exciting-spice-armadillo.glitch.me/getExpenseCost/${userId}`)
            .then(res => res.json())
            .then(data => setExpenceData(data))
            .catch(err => console.log(err))
    }, [1]);

    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, items.length);

    React.useEffect(() => {
        setPage(0);
    }, [itemsPerPage]);



    const handleSelectChange = (name, value) => {
        if (name === 'month') {
            setSelectedMonth(value);
        } else if (name === 'year') {
            setSelectedYear(value);
        }
    };

    return (

        <View>
            {/* <View style={styles.container}>
                <Picker selectedValue={selectedMonth} onValueChange={(value) => handleSelectChange('month', value)} style={styles.picker}>
                    <Picker.Item label="Select Month" value="" />
                    {months.map((month, index) => (
                        <Picker.Item key={index} label={month} value={index + 1} />
                    ))}
                </Picker>

                <Picker selectedValue={selectedYear} onValueChange={(value) => handleSelectChange('year', value)} style={styles.picker} >
                    <Picker.Item label="Select Year" value="" />
                    {years.map((year, index) => (
                        <Picker.Item key={index} label={year.toString()} value={year} />
                    ))}
                </Picker>
            </View> */}

            <DataTable>
                <DataTable.Header>
                    <DataTable.Title >CATEGORY</DataTable.Title>
                    <DataTable.Title >PRODUCT</DataTable.Title>
                    <DataTable.Title >COST</DataTable.Title>
                    <DataTable.Title >DATE</DataTable.Title>
                    <DataTable.Title numeric>TAX AMOUNT</DataTable.Title>
                </DataTable.Header>

                {items.slice(from, to).map((item) => (
                    <DataTable.Row key={item.id} onPress={() => console.log("row clicked", item.id)}>
                        <DataTable.Cell >{item.category}</DataTable.Cell>
                        <DataTable.Cell >{item.product}</DataTable.Cell>
                        <DataTable.Cell >{item.cost}</DataTable.Cell>
                        <DataTable.Cell >{item.p_date}</DataTable.Cell>
                        <DataTable.Cell numeric>{item.tax_amount}</DataTable.Cell>
                    </DataTable.Row>
                ))}

                <DataTable.Pagination page={page} numberOfPages={Math.ceil(items.length / itemsPerPage)} onPageChange={(page) => setPage(page)} label={`${from + 1}-${to} of ${items.length}`} numberOfItemsPerPageList={numberOfItemsPerPageList}
                    numberOfItemsPerPage={itemsPerPage} onItemsPerPageChange={onItemsPerPageChange} showFastPaginationControls selectPageDropdownLabel={'Rows per page'} />
            </DataTable>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginTop: 50,
    },
    picker: {
        backgroundColor: 'transparent',
        ...Platform.select({
            android: {
                marginTop: -10,
            },
        }),
    },
});

export default ExpenceReport;