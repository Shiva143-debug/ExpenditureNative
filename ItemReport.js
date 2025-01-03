
import * as React from 'react';
import { DataTable } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { useEffect } from "react";
import { useRoute } from '@react-navigation/native';
import { useAuth } from './AuthContext';

const ItemReport = () => {
  const { id } = useAuth();
  const route = useRoute();
  const { category, Month, Year } = route.params;
  const [items, setExpenceData] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [itemsPerPage, onItemsPerPageChange] = React.useState(8);
  const [numberOfItemsPerPageList] = React.useState([2, 3, 4, 8]);

  useEffect(() => {
    const userId = id;
    fetch(`https://exciting-spice-armadillo.glitch.me/getExpenseCost/${userId}`)
      .then(res => res.json())
      .then(data => setExpenceData(data))
      .catch(err => console.log(err));
  }, []);

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, items.length);
  const filteredItems = items.filter(item => {
    const itemMonth = new Date(item.p_date).getMonth() + 1;
    const itemYear = new Date(item.p_date).getFullYear();

    return (
      (category ? item.category === category : true) &&
      (Month ? itemMonth == Month : true) &&
      (Year ? itemYear == Year : true)
    );
  });

  React.useEffect(() => {
    setPage(0);
  }, [itemsPerPage]);

  return (
    <View>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>CATEGORY</DataTable.Title>
          <DataTable.Title>PRODUCT</DataTable.Title>
          <DataTable.Title>COST</DataTable.Title>
          <DataTable.Title>DATE</DataTable.Title>
          <DataTable.Title>TAX AMOUNT</DataTable.Title>
        </DataTable.Header>

        {filteredItems.slice(from, to).map((item) => (
          <DataTable.Row key={item.id} onPress={() => console.log("row clicked", item.id)}>
            <DataTable.Cell>{item.category}</DataTable.Cell>
            <DataTable.Cell>{item.product}</DataTable.Cell>
            <DataTable.Cell>{item.cost}</DataTable.Cell>
            <DataTable.Cell>{item.p_date}</DataTable.Cell>
            <DataTable.Cell numeric>{item.tax_amount}</DataTable.Cell>
          </DataTable.Row>
        ))}

        <DataTable.Pagination page={page} numberOfPages={Math.ceil(filteredItems.length / itemsPerPage)} onPageChange={(page) => setPage(page)} label={`${from + 1}-${to} of ${filteredItems.length}`}
          numberOfItemsPerPageList={numberOfItemsPerPageList} numberOfItemsPerPage={itemsPerPage} onItemsPerPageChange={onItemsPerPageChange} showFastPaginationControls selectPageDropdownLabel={'Rows per page'}
        />
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
    marginTop: -10,
  },
});

export default ItemReport;
