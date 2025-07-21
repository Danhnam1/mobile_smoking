import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const Introduce = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerRow}>
        <Ionicons
          name="leaf-outline"
          size={36}
          color="#43e97b"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.header}>Giới thiệu về QuitNow</Text>
      </View>
      <View style={styles.headerSpacer} />
      <Text style={styles.intro}>
        QuitNow là ứng dụng hỗ trợ bạn cai thuốc lá một cách khoa học, cá nhân
        hóa và hiệu quả. Chúng tôi đồng hành cùng bạn trên hành trình sống khỏe
        mạnh hơn!
      </Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sứ mệnh của chúng tôi</Text>
        <Text style={styles.sectionText}>
          Giúp hàng triệu người Việt Nam từ bỏ thuốc lá, cải thiện sức khỏe và
          tiết kiệm chi phí cho bản thân và gia đình.
        </Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tính năng nổi bật</Text>
        <View style={styles.featureItem}>
          <MaterialCommunityIcons
            name="calendar-check-outline"
            size={24}
            color="#27ae60"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.featureText}>
            Lập kế hoạch cai thuốc cá nhân hóa
          </Text>
        </View>
        <View style={styles.featureItem}>
          <MaterialCommunityIcons
            name="account-group-outline"
            size={24}
            color="#27ae60"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.featureText}>
            Cộng đồng hỗ trợ, chia sẻ kinh nghiệm
          </Text>
        </View>
        <View style={styles.featureItem}>
          <MaterialCommunityIcons
            name="medal-outline"
            size={24}
            color="#27ae60"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.featureText}>
            Theo dõi tiến trình, nhận huy hiệu thành tích
          </Text>
        </View>
        <View style={styles.featureItem}>
          <MaterialCommunityIcons
            name="doctor"
            size={24}
            color="#27ae60"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.featureText}>
            Kết nối chuyên gia, nhận tư vấn trực tiếp
          </Text>
        </View>
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
  sectionText: {
    fontSize: 15,
    color: "#444",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  featureText: {
    fontSize: 15,
    color: "#222",
  },
});

export default Introduce;
