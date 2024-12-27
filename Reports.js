import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { Avatar, Button, Card } from 'react-native-paper';
const LeftContent = props => <Avatar.Icon {...props} icon="folder" />


const Reports = () => {

  const GotoSource = () => {

  }

  const GotoExpences = () => {

  }

  const GotoCategory = () => {

  }
  const GotoProduct=()=>{

  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

      <Card>
        <Card.Title title="Expences" subtitle="View Expences Reports" left={LeftContent} />
        <Card.Cover source={{ uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1735300659/expence_image_n7lqjs.webp' }} />
        <Card.Actions>
          <Button onPress={GotoExpences}>View</Button>
        </Card.Actions>
      </Card>

      <Card>
        <Card.Title title="Source" subtitle="View Source of Income Reports" left={LeftContent} />
        <Card.Cover source={{ uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1735300123/sourceimage_vnl86u.jpg' }} />
        <Card.Actions>
          <Button onPress={GotoSource}>View</Button>
        </Card.Actions>
      </Card>

      <Card>
        <Card.Title title="Category" subtitle="View Category Reports" left={LeftContent} />
        <Card.Cover source={{ uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1735300799/category_image_bgrd5p.webp' }} />
        <Card.Actions>
          <Button onPress={GotoCategory}>View</Button>
        </Card.Actions>
      </Card>

      <Card>
        <Card.Title title="PRODUCT" subtitle="View Product Reports" left={LeftContent} />
        <Card.Cover source={{ uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1735300982/product_image_y07vb2.jpg' }} />
        <Card.Actions>
          <Button onPress={GotoProduct}>View</Button>
        </Card.Actions>
      </Card>

    </ScrollView>
  )
}
export default Reports