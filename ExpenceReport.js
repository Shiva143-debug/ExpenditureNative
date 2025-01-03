import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from "@react-navigation/native";
import { useAuth } from './AuthContext';

const ExpenceReport = () => {
    const { id } = useAuth();
    const navigation = useNavigation();
    const [expenceData, setExpenceData] = React.useState([])

    const [openMonth, setOpenMonth] = useState(false);
    const [Month, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
    const [months, setMonths] = useState([
        { label: 'January', value: '1' },
        { label: 'February', value: '2' },
        { label: 'March', value: '3' },
        { label: 'April', value: '4' },
        { label: 'May', value: '5' },
        { label: 'June', value: '6' },
        { label: 'July', value: '7' },
        { label: 'August', value: '8' },
        { label: 'September', value: '9' },
        { label: 'October', value: '10' },
        { label: 'November', value: '11' },
        { label: 'December', value: '12' },
    ]);

    const [openYear, setOpenYear] = useState(false);
    const [Year, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [years, setYears] = useState([
        { label: '2023', value: '2023' },
        { label: '2024', value: '2024' },
        { label: '2025', value: '2025' },
    ]);

    useEffect(() => {
        const userId = id;
        fetch(`https://exciting-spice-armadillo.glitch.me/getExpenseCost/${userId}`)
            .then(res => res.json())
            .then(data => setExpenceData(data))
            .catch(err => console.log(err));
    }, [id]);

    const filteredTotalCostData = expenceData.filter(
        (d) => d.month.toString() === Month && d.year.toString() === Year
    );


    const onProductDetail=(item)=>{
       console.log(item.id)
       let itemId = item.id
       navigation.navigate('ProductDetail', { id, itemId });
    }

    const renderExpenceCard = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.title}>Expence: {item.product}</Text>
            <View style={{ display: "flex", flexDirection: "row" }}>
                <Text style={{ flex: 1 }}>Category: {item.category}</Text>
                <Icon name="arrow-forward" size={25} onPress={()=>onProductDetail(item)}/>
            </View>
            <View style={{ display: "flex", flexDirection: "row" }}>
                <Text style={{ flex: 1 }}>Cost: {item.cost}</Text>
                <Text style={{ flex: 1, textAlign: "right" }}>Date: {item.p_date}</Text>
            </View>
        </View>
    );

    return (
        <View>
            <View style={styles.dropdownContainer}>
                {!openYear && (
                    <DropDownPicker open={openMonth} value={Month} items={months} setValue={setSelectedMonth} setItems={setMonths} placeholder="Select Month" style={styles.dropdown} dropDownContainerStyle={styles.dropdownList} listMode="SCROLLVIEW"
                        setOpen={(isOpen) => {
                            setOpenMonth(isOpen);
                            if (isOpen) setOpenYear(false);
                        }}
                    />
                )}

                {!openMonth && (
                    <DropDownPicker open={openYear} value={Year} items={years} setValue={setSelectedYear} setItems={setYears} placeholder="Select Year" style={styles.dropdown} dropDownContainerStyle={styles.dropdownList} listMode="SCROLLVIEW"
                        setOpen={(isOpen) => {
                            setOpenYear(isOpen);
                            if (isOpen) setOpenMonth(false);
                        }} />
                )}
            </View>
            <FlatList
                data={filteredTotalCostData}
                renderItem={renderExpenceCard}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.container}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        marginBottom: 12,
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    dropdownContainer: { marginBottom: 20 },
    dropdown: { borderColor: "#ccc", width: "90%", marginBottom: 10 },
    dropdownList: { zIndex: 1, maxHeight: 800 },
});

export default ExpenceReport;

