import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { Avatar, Button, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LeftContent = props => (
  <Avatar.Icon {...props} icon={() => <Icon name="assignment" size={16} color="white" />} />
);

const Reports = ({ navigation }) => {

  const GotoSource = () => {
    navigation.navigate('SourceReports')
  }

  const GotoExpences = () => {
    navigation.navigate('ExpenceReports');
  }

  const GotoCategory = () => {
    navigation.navigate('CategoryReports');
  }

  const GotoProduct = () => {
    navigation.navigate('ProductReports');
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
      <Card style={styles.card}>
        <Card.Title title="Expences" subtitle="View Expences Reports" left={LeftContent} />
        <Card.Cover source={{ uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1735300659/expence_image_n7lqjs.webp' }} />
        <Card.Actions>
          <Button onPress={GotoExpences}>View</Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Source" subtitle="View Source of Income Reports" left={LeftContent} />
        <Card.Cover source={{ uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1735300123/sourceimage_vnl86u.jpg' }} />
        <Card.Actions>
          <Button onPress={GotoSource}>View</Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Category" subtitle="View Category Reports" left={LeftContent} />
        <Card.Cover source={{ uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1735300799/category_image_bgrd5p.webp' }} />
        <Card.Actions>
          <Button onPress={GotoCategory}>View</Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="PRODUCT" subtitle="View Product Reports" left={LeftContent} />
        <Card.Cover source={{ uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1735300982/product_image_y07vb2.jpg' }} />
        <Card.Actions>
          <Button onPress={GotoProduct}>View</Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    marginHorizontal: 10,
    borderRadius: 8,
    elevation: 5,
  },
});

export default Reports;
