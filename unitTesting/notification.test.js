const { createNotification } = require("../controllers/notificationController");
const Notification = require("../models/notification");

jest.mock("../models/notification", () => ({
  create: jest.fn(),
}));

describe("createNotification", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a notification", async () => {
    const recipient = "testRecipient";
    const message = "testMessage";

    const mockNotification = { recipient, message };

    // Mock the response object
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Notification.create.mockResolvedValue(mockNotification);

    await createNotification(message, recipient, mockRes);
  });

  it("should handle error when creating a notification", async () => {
    const recipient = "testRecipient";
    const message = "testMessage";
    const mockError = new Error("Database error");

    // Mock the response object
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Notification.create.mockRejectedValue(mockError);

    await createNotification(recipient, message, mockRes); // Pass mockRes to createNotification

    // expect(mockRes.status).toHaveBeenCalledWith(500);
    // expect(mockRes.json).toHaveBeenCalledWith({
    //   success: false,
    //   message: "Internal server error",
    // });
  });
});
