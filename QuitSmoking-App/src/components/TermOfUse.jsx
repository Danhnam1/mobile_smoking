import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TermOfUse = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerRow}>
        <Ionicons
          name="document-text-outline"
          size={36}
          color="#43e97b"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.header}>Điều khoản sử dụng</Text>
      </View>
      <View style={styles.headerSpacer} />
      <Text style={styles.intro}>
        Vui lòng đọc kỹ các điều khoản dưới đây trước khi sử dụng ứng dụng
        QuitNow.
      </Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Quyền riêng tư</Text>
        <Text style={styles.sectionText}>
          Chúng tôi cam kết bảo mật thông tin cá nhân của bạn. Dữ liệu chỉ được
          sử dụng để cải thiện trải nghiệm và không chia sẻ cho bên thứ ba.
        </Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Trách nhiệm người dùng</Text>
        <Text style={styles.sectionText}>
          Bạn cần cung cấp thông tin chính xác, không sử dụng ứng dụng cho mục
          đích vi phạm pháp luật hoặc gây hại cho người khác.
        </Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Sử dụng dịch vụ</Text>
        <Text style={styles.sectionText}>
          Ứng dụng cung cấp thông tin tham khảo, không thay thế tư vấn y tế
          chuyên nghiệp. Hãy tham khảo ý kiến bác sĩ khi cần thiết.
        </Text>
      </View>
      <Text style={styles.closing}>
        Cảm ơn bạn đã tin tưởng và sử dụng QuitNow. Chúc bạn thành công trên
        hành trình cai thuốc!
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    padding: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerSpacer: {
    height: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
  },
  intro: {
    fontSize: 15,
    color: "#555",
    marginBottom: 18,
  },
  section: {
    marginBottom: 28,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#43e97b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#27ae60",
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 15,
    color: "#444",
  },
  closing: {
    fontSize: 15,
    color: "#388e3c",
    fontWeight: "600",
    marginTop: 18,
    textAlign: "center",
  },
});

export default TermOfUse;
