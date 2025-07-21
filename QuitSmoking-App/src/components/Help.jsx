import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const Help = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerRow}>
        <Ionicons
          name="help-circle-outline"
          size={36}
          color="#43e97b"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.header}>Trợ giúp & Hỗ trợ</Text>
      </View>
      <View style={styles.headerSpacer} />
      <Text style={styles.intro}>
        Bạn cần hỗ trợ? Dưới đây là các câu hỏi thường gặp và thông tin liên hệ
        hỗ trợ.
      </Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Câu hỏi thường gặp</Text>
        <View style={styles.faqItem}>
          <MaterialCommunityIcons
            name="smoking-off"
            size={24}
            color="#27ae60"
            style={{ marginRight: 8 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.faqQ}>
              Làm sao để bắt đầu kế hoạch cai thuốc?
            </Text>
            <Text style={styles.faqA}>
              Bạn hãy vào mục "Quit Plan" và làm theo các bước hướng dẫn để tạo
              kế hoạch phù hợp với bản thân.
            </Text>
          </View>
        </View>
        <View style={styles.faqItem}>
          <MaterialCommunityIcons
            name="account-check-outline"
            size={24}
            color="#27ae60"
            style={{ marginRight: 8 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.faqQ}>
              Tôi có thể liên hệ chuyên gia ở đâu?
            </Text>
            <Text style={styles.faqA}>
              Bạn có thể sử dụng tính năng "Coach" để trò chuyện với chuyên gia
              hỗ trợ cai thuốc.
            </Text>
          </View>
        </View>
        <View style={styles.faqItem}>
          <MaterialCommunityIcons
            name="calendar-check-outline"
            size={24}
            color="#27ae60"
            style={{ marginRight: 8 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.faqQ}>Làm sao để theo dõi tiến trình?</Text>
            <Text style={styles.faqA}>
              Vào mục "Track Progress" để xem số ngày, số tiền tiết kiệm và các
              thành tích của bạn.
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Liên hệ hỗ trợ</Text>
        <Text style={styles.contactText}>
          Nếu bạn cần hỗ trợ thêm, hãy liên hệ với chúng tôi qua email:
        </Text>
        <TouchableOpacity
          onPress={() => Linking.openURL("mailto:support@quitnowapp.vn")}
        >
          <Text style={styles.email}>support@quitnowapp.vn</Text>
        </TouchableOpacity>
      </View>
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
  faqItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  faqQ: {
    fontWeight: "600",
    color: "#222",
    fontSize: 15,
  },
  faqA: {
    color: "#555",
    fontSize: 14,
    marginTop: 2,
  },
  contactText: {
    fontSize: 15,
    color: "#444",
    marginBottom: 6,
  },
  email: {
    color: "#43e97b",
    fontWeight: "bold",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});

export default Help;
