
// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// const BalanceList = () => {
//   const route = useRoute();
//   const { id } = route.params;
//   const [totalIncomeData, setTotalIncome] = useState([]);
//  const [totalCostData, setExpenseCost] = useState([]);

//  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


//   useEffect(() => {
//     if (id) {
//       fetch(`https://exciting-spice-armadillo.glitch.me/getSourceData/${id}`)
//         .then((res) => res.json())
//         .then((data) => setTotalIncome(Array.isArray(data) ? data : []))
//         .catch((err) => console.log(err));

//       fetch(`https://exciting-spice-armadillo.glitch.me/getExpenseCost/${id}`)
//         .then((res) => res.json())
//         .then((data) => setExpenseCost(data))
//         .catch((err) => console.log(err));
//     }
//   }, [id]);

//   const combinedData = [...totalIncomeData, ...totalCostData];

//   const groupedData = combinedData.reduce((acc, curr) => {
//     const { month, year } = curr;
//     const key = `${month}-${year}`;
//     if (!acc[key]) {
//       acc[key] = {
//         month,
//         year,
//         income: 0,
//         expenses: 0,
//         balance: 0,
//       };
//     }
//     if (curr.amount) {
//       acc[key].income += parseFloat(curr.amount);
//     }
//     if (curr.cost) {
//       acc[key].expenses += parseFloat(curr.cost);
//     }
//     acc[key].balance = acc[key].income - acc[key].expenses;
//     return acc;
//   }, {});

//   const groupedArray = Object.values(groupedData);



//   return (
//     <View>
//     <FlatList
//       data={groupedArray}
//       keyExtractor={(item) => item.income}
//       renderItem={({ item }) => (
//         <TouchableOpacity style={styles.card}>
//           <ImageBackground
//             source={{
//               uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1721734044/black-white_iidqap.webp',
//             }}
//             style={styles.backgroundImage}
//             imageStyle={{ borderRadius: 10 }}
//           >
//             <View style={styles.cardContent}>
//                 <Text style={styles.cardTitle}>{item.month}</Text>
//                 <Text style={styles.cardIncomeText}><Icon name="currency-rupee" size={16} /> {item.income}</Text>
//                 <Text style={styles.cardExpenceText}><Icon name="currency-rupee" size={16} /> {item.expenses}</Text>
//                 <Text style={styles.cardBalanceText}><Icon name="currency-rupee" size={16} /> {item.balance}</Text>
//               </View>
//           </ImageBackground>
//         </TouchableOpacity>
//       )}
//     />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       padding: 10,
//     },

//     flatList: {
//       flex: 1,
//     },

//     card: {
//       marginBottom: 15,
//       borderRadius: 10, 
//       overflow: 'hidden', 
//       height:120
//     },
//     backgroundImage: {
//       width: '100%',
//       height: 120,
//       justifyContent: 'flex-end',
//     },


//     cardTitle: {
//       fontSize: 18,
//       color: 'white',
//       fontWeight: 'bold',
//     },

//     cardText: {
//       fontSize: 16,
//       color: 'white',
//       marginTop: 5,
//     },
//     cardIncomeText:{
//         fontSize: 16,
//         color: 'blue',
//         marginTop: 5,
//     },
//     cardExpenceText:{
//         fontSize: 16,
//         color: 'red',
//         marginTop: 5,
//     },
//     cardBalanceText:{
//         fontSize: 16,
//         color: 'green',
//         marginTop: 5,
//     },
//     icon: {
//       marginLeft: 10
//     },
//   });


// export default BalanceList;



import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

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


    const totalBalance = groupedArray.reduce((acc, curr) => acc + curr.balance, 0);
    //   console.log(groupedArray)

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
                                    expence {item.expenses}
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
        // textAlign: 'center',
    },
    cardExpenseText: {
        flex: 1,
        color: 'red',
        // textAlign: 'center',
    },
    cardBalanceText: {
        flex: 1,
        color: 'green',
        // textAlign: 'center',
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
