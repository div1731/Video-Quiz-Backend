const Feedback = require("../../models/feedback.model");

const createFeedback = async (req, res) => {
  try {
    const { name, email, rating, message } = req.body;
    
    // Create feedback with optional user ID if logged in
    const feedback = new Feedback({
      name,
      email,
      rating,
      message,
      user: req.user ? req.user.id : null,
    });

    await feedback.save();

    return res.status(201).json({
      status: true,
      message: "Feedback submitted successfully! Thank you for your input.",
      data: feedback,
    });
  } catch (error) {
    console.error("CreateFeedback error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "An error occurred while submitting feedback.",
    });
  }
};

module.exports = {
  createFeedback,
};
