const paypalService = require("../services/payment.service");
const Payment = require("../models/payment.model");
const UserMembership = require("../models/userMembership.model");
const MembershipPackage = require("../models/membershipPackage.model");
const transactionService = require("../services/transaction.service");

exports.createPaypalOrder = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { package_id } = req.body;

    if (!userId) {
      return res.status(401).json({ 
        message: "Người dùng chưa đăng nhập",
        code: "UNAUTHORIZED"
      });
    }

    if (!package_id) {
      return res.status(400).json({ 
        message: "Thiếu thông tin gói membership",
        code: "MISSING_PACKAGE_ID"
      });
    }

    const pkg = await MembershipPackage.findById(package_id);
    if (!pkg) {
      return res.status(404).json({ 
        message: "Không tìm thấy gói membership",
        code: "PACKAGE_NOT_FOUND"
      });
    }

    // Kiểm tra xem user đã có gói active chưa
    const existingMembership = await UserMembership.findOne({
      user_id: userId,
      status: "active"
    });

    if (existingMembership) {
      return res.status(400).json({
        message: "Bạn đã có gói membership đang hoạt động",
        code: "ACTIVE_MEMBERSHIP_EXISTS"
      });
    }

    const order = await paypalService.createOrder(pkg.price, "VND");
    const transactionId = order.id;

    // Tạo payment record
    const payment = await Payment.create({
      user_id: userId,
      package_id,
      payment_method: "paypal",
      amount: pkg.price,
      transaction_id: transactionId,
      status: "pending",
    });

    const approveUrl = order.links.find((l) => l.rel === "approve")?.href;
    if (!approveUrl) {
      throw new Error("Không tìm thấy URL xác nhận PayPal");
    }

    res.json({ 
      approveUrl, 
      orderId: transactionId,
      paymentId: payment._id
    });
  } catch (err) {
    console.error("[PayPal Create Order Error]", err);
    
    // Xóa payment record nếu có lỗi
    if (err.paymentId) {
      await Payment.findByIdAndDelete(err.paymentId);
    }
    
    res.status(500).json({ 
      message: "Không tạo được đơn PayPal",
      error: err.message,
      code: "PAYPAL_ORDER_CREATION_FAILED"
    });
  }
};

exports.capturePaypalOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        message: "Thiếu thông tin đơn hàng",
        code: "MISSING_ORDER_ID"
      });
    }

    // Kiểm tra payment record
    const payment = await Payment.findOne({ 
      transaction_id: orderId,
      user_id: userId,
      status: "pending"
    });

    if (!payment) {
      return res.status(404).json({ 
        message: "Không tìm thấy giao dịch",
        code: "PAYMENT_NOT_FOUND"
      });
    }

    const captured = await paypalService.captureOrder(orderId);
    if (!captured || captured.status !== "COMPLETED") {
      throw new Error("Thanh toán PayPal không thành công");
    }

    // Cập nhật Payment thành công
    payment.status = "success";
    payment.payment_date = new Date();
    await payment.save();

    // Hủy các membership cũ
    await UserMembership.updateMany(
      { user_id: userId, status: "active" },
      { $set: { status: "expired" } }
    );

    const pkg = await MembershipPackage.findById(payment.package_id);
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + pkg.duration_days);

    const userMembership = await UserMembership.create({
      user_id: userId,
      package_id: pkg._id,
      payment_id: payment._id,
      payment_date: new Date(),
      expire_date: expireDate,
      status: "active",
    });

    await transactionService.createTransaction(
      userId,
      pkg.price,
      "membership_payment",
      payment._id,
      `Mua gói ${pkg.name}`
    );

    res.json({ 
      message: "Thanh toán thành công", 
      userMembership,
      payment
    });
  } catch (err) {
    console.error("[PayPal Capture Error]", err);
    
    // Cập nhật payment status nếu có lỗi
    if (err.payment) {
      err.payment.status = "failed";
      await err.payment.save();
    }
    
    res.status(500).json({ 
      message: "Không xác nhận được thanh toán",
      error: err.message,
      code: "PAYPAL_CAPTURE_FAILED"
    });
  }
}; 