import * as React from 'react';
import { DataTable } from 'react-native-paper';
import { useEffect } from "react";

const ProductReport = () => {
  const [page, setPage] = React.useState(0);
  const [numberOfItemsPerPageList] = React.useState([2, 3, 4, 8]);
  const [itemsPerPage, onItemsPerPageChange] = React.useState(8);
  const [items, setProductsData] = React.useState([])

  useEffect(() => {
    const userId = 1;
    fetch(`https://exciting-spice-armadillo.glitch.me/getCategoriesAndProducts/${userId}`)
      .then(res => res.json())
      .then(data => setProductsData(data))
      .catch(err => console.log(err))
  }, [1]);

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, items.length);

  React.useEffect(() => {
    setPage(0);
  }, [itemsPerPage]);

  return (
    <DataTable>
      <DataTable.Header>
        <DataTable.Title numeric>ID</DataTable.Title>
        <DataTable.Title>CATEGORY</DataTable.Title>
        <DataTable.Title>PRODUCT</DataTable.Title>
      </DataTable.Header>

      {items.slice(from, to).map((item) => (
        <DataTable.Row key={item.id}>
          <DataTable.Cell numeric>{item.id}</DataTable.Cell>
          <DataTable.Cell >{item.category}</DataTable.Cell>
          <DataTable.Cell >{item.product}</DataTable.Cell>
        </DataTable.Row>
      ))}

      <DataTable.Pagination page={page} numberOfPages={Math.ceil(items.length / itemsPerPage)} onPageChange={(page) => setPage(page)} label={`${from + 1}-${to} of ${items.length}`} numberOfItemsPerPageList={numberOfItemsPerPageList}
        numberOfItemsPerPage={itemsPerPage} onItemsPerPageChange={onItemsPerPageChange} showFastPaginationControls selectPageDropdownLabel={'Rows per page'}/>
    </DataTable>
  );
};

export default ProductReport;