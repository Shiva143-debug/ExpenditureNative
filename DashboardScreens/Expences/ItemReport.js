import React, { useEffect, useState } from 'react';
import { FlatList, View, Image, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAuth } from '../../AuthContext';
import LoaderSpinner from '../../LoaderSpinner';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {getExpenseCosts} from "../../services/apiService"

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ItemReport = () => {
  const { id } = useAuth();
  const route = useRoute();
  const { category, Month, Year } = route.params;
  const [expenseItems, setExpenseItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getExpenseItems = async () => {
    if (!id) return;
    try {
      setLoading(true);
     const data = await getExpenseCosts(id);
      setExpenseItems(data);
    } catch (error) {
      console.error('Error fetching expense items:', error);
      setExpenseItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getExpenseItems();
  }, [id]);

  const filteredItems = expenseItems.filter(item => {
    const itemMonth = new Date(item.p_date).getMonth() + 1;
    const itemYear = new Date(item.p_date).getFullYear();
    return (
      (category ? item.category === category : true) &&
      (Month ? itemMonth == Month : true) &&
      (Year ? itemYear == Year : true)
    );
  });

  const renderHeader = () => (
    <ThemedView style={styles.headerContainer}>
      <LinearGradient colors={['#2C3E50', '#34495E']} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>{category} Details</ThemedText>
          <ThemedText style={styles.headerSubtitle}>{monthNames[parseInt(Month) - 1]} {Year}
          </ThemedText>
        </View>
      </LinearGradient>
    </ThemedView>
  );

  const renderItemCard = ({ item }) => {
    const taxRate = 0.18; // 18% GST
    const cost = parseFloat(item.cost);
    const taxAmount = item.is_tax_app === 'Yes' ? cost * taxRate : 0;
    const totalAmount = cost + taxAmount;

    return (
    <ThemedView style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.productIcon}>
          <Icon name="shopping-bag" size={24} color="#4CAF50" />
        </View>
        <View style={styles.headerInfo}>
          <ThemedText style={styles.productTitle}>{item.product}</ThemedText>
          <ThemedText style={styles.dateText}><Icon name="event" size={14} /> {item.p_date} </ThemedText>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <ThemedText style={styles.detailLabel}>Category</ThemedText>
            <ThemedText style={styles.detailValue}>{item.category}</ThemedText>
          </View>
          <View style={styles.detailItem}>
            <ThemedText style={styles.detailLabel}>Amount</ThemedText>
            <ThemedText style={styles.detailValue}>₹{cost.toLocaleString()}</ThemedText>
          </View>
          <View style={styles.detailItem}>
            <ThemedText style={styles.detailLabel}>Tax Applicable</ThemedText>
            <ThemedText style={[
                styles.taxStatus,
                { color: item.is_tax_app === 'yes' ? '#4CAF50' : '#FF5252' }
              ]}>
                {item.is_tax_app}
              </ThemedText>
          </View>
        </View>

        
        <View style={styles.detailRow}>

          {item.is_tax_app === 'yes' && (
            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Tax Amount</ThemedText>
              <ThemedText style={styles.detailValue}>₹{item.tax_amount}</ThemedText>
            </View>
          )}
        </View>


        {item.description && (
          <View style={styles.descriptionContainer}>
            <ThemedText style={styles.detailLabel}>Description</ThemedText>
            <ThemedText style={styles.description}>{item.description}</ThemedText>
          </View>
        )}
      </View>

      {item.image && (
        <View style={styles.imageContainer}>
          <Image  source={{ uri: item.image }}  style={styles.image} resizeMode="cover"/>
          <TouchableOpacity  style={styles.eyeIconButton}
            onPress={() => setSelectedImage(item.image)}
          >
            <Icon name="remove-red-eye" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <LoaderSpinner shouldLoad={loading} />
      <View style={styles.headerSection}>
        {renderHeader()}
      </View>
      <View style={styles.listSection}>
        <FlatList data={filteredItems} renderItem={renderItemCard} keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={true}/>
      </View>
      <Modal visible={!!selectedImage} transparent={true}
        animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity   style={styles.closeButton}onPress={() => setSelectedImage(null)}>
            <Icon name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Image  source={{ uri: selectedImage }}  style={styles.fullScreenImage} resizeMode="contain"/>
        </View>
      </Modal>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    zIndex: 1,
    height: 100,
    backgroundColor: 'transparent',
  },
  listSection: {
    flex: 1,
    zIndex: 0,
  },
  headerContainer: {
    marginBottom: 5,
  },
  headerGradient: {
    borderRadius: 12,
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContent: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  listContainer: {
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 5,
    borderColor: 'rgba(221, 215, 215, 0.1)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(221, 215, 215, 0.1)',
  },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    opacity: 0.6,
  },
  detailsContainer: {
    padding: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(221, 215, 215, 0.1)',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  imageContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(221, 215, 215, 0.1)',
    padding: 15,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  eyeIconButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -22 }, { translateY: -22 }],
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: screenWidth,
    height: screenHeight,
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  taxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taxStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  taxInfo: {
    fontSize: 12,
    marginLeft: 8,
    opacity: 0.7,
  },
  taxAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(221, 215, 215, 0.1)',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});

export default ItemReport;

