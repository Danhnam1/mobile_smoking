import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PaymentService } from '../services/payment.service';
import { useFocusEffect } from '@react-navigation/native';

const TransactionItem = ({ item }) => (
  <View style={styles.transactionItem}>
    <View style={styles.transactionIcon}>
      <Ionicons name="receipt-outline" size={24} color="#007AFF" />
    </View>
    <View style={styles.transactionDetails}>
      <Text style={styles.transactionDescription}>{item.description || 'Thanh toán gói thành viên'}</Text>
      <Text style={styles.transactionDate}>{new Date(item.created_at).toLocaleString('vi-VN')}</Text>
    </View>
    <View style={styles.transactionAmountContainer}>
      <Text style={[styles.transactionAmount, item.amount > 0 ? styles.positiveAmount : {}]}>
        {item.amount.toLocaleString('vi-VN')} VND
      </Text>
      <Text style={[styles.transactionStatus, styles[`status_${item.status}`]]}>
        {item.status}
      </Text>
    </View>
  </View>
);

const TransactionsScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async () => {
    try {
      const response = await PaymentService.getUserTransactions();
      setTransactions(response || []);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      // Optionally, show an alert to the user
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchTransactions();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  if (loading) {
    return <ActivityIndicator style={styles.centered} size="large" color="#007AFF" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
      </View>
      {transactions.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Bạn chưa có giao dịch nào.</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <TransactionItem item={item} />}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#007AFF"]} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343A40',
  },
  listContainer: {
    padding: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  transactionIcon: {
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  transactionDate: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positiveAmount: {
    color: '#28A745',
  },
  transactionStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  status_success: {
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    color: '#28A745',
  },
  status_failed: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    color: '#DC3545',
  },
  status_pending: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    color: '#FFC107',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6C757D',
  },
});

export default TransactionsScreen;
