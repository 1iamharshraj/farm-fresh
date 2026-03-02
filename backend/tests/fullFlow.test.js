/**
 * Farm Fresh - Full End-to-End Flow Tests
 *
 * Tests the complete lifecycle:
 *  1. Auth (register & login for all 3 roles)
 *  2. Categories (seed)
 *  3. Produce (farmer creates, customer browses)
 *  4. Cart (customer adds items, updates, removes)
 *  5. Order (customer places, farmer confirms & prepares)
 *  6. Delivery (agent accepts, picks up, delivers)
 *  7. Review (customer reviews delivered order)
 *  8. Analytics (farmer & customer analytics)
 *  9. Smart (demand forecast, price suggestions)
 * 10. Notifications
 */

const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Must set env vars BEFORE requiring the app
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-key-12345";
process.env.JWT_EXPIRE = "7d";
process.env.NODE_ENV = "test";

const app = require("./testApp");

let mongoServer;

// Store tokens and IDs across tests
const state = {
  farmer: { token: null, id: null },
  customer: { token: null, id: null },
  agent: { token: null, id: null },
  category: { id: null },
  produce: { id: null },
  produce2: { id: null },
  cartItemId: null,
  order: { id: null, number: null },
  delivery: { id: null },
  review: { id: null },
  notification: { id: null },
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
});

/* ═══════════════════════════════════════════════
   PHASE 1: HEALTH CHECK
   ═══════════════════════════════════════════════ */
describe("Health Check", () => {
  test("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain("running");
  });
});

/* ═══════════════════════════════════════════════
   PHASE 2: AUTHENTICATION
   ═══════════════════════════════════════════════ */
describe("Authentication", () => {
  describe("Register", () => {
    test("Register a farmer", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Ravi Kumar",
        email: "farmer@test.com",
        password: "password123",
        phone: "9876543210",
        role: "farmer",
        address: {
          street: "Farm Road 1",
          city: "Vellore",
          state: "Tamil Nadu",
          pincode: "632001",
        },
        farmDetails: {
          farmName: "Ravi's Organic Farm",
          farmSize: "5 acres",
          description: "Fresh organic vegetables",
          specializations: ["vegetables", "fruits"],
        },
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe("farmer");
      state.farmer.token = res.body.data.token;
      state.farmer.id = res.body.data.user._id;
    });

    test("Register a customer", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Anita Sharma",
        email: "customer@test.com",
        password: "password123",
        phone: "9876543211",
        role: "customer",
        address: {
          street: "MG Road 10",
          city: "Vellore",
          state: "Tamil Nadu",
          pincode: "632002",
        },
      });
      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe("customer");
      state.customer.token = res.body.data.token;
      state.customer.id = res.body.data.user._id;
    });

    test("Register a delivery agent", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Suresh Driver",
        email: "agent@test.com",
        password: "password123",
        phone: "9876543212",
        role: "delivery_agent",
        address: {
          street: "Station Road 5",
          city: "Vellore",
          state: "Tamil Nadu",
          pincode: "632003",
        },
        deliveryDetails: {
          vehicleType: "motorcycle",
          vehicleNumber: "TN01AB1234",
          isAvailable: true,
          serviceRadius: 15,
        },
      });
      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe("delivery_agent");
      state.agent.token = res.body.data.token;
      state.agent.id = res.body.data.user._id;
    });

    test("Reject duplicate email registration", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Duplicate",
        email: "farmer@test.com",
        password: "password123",
        phone: "9876543299",
        role: "customer",
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Login", () => {
    test("Login as farmer", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "farmer@test.com",
        password: "password123",
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe("farmer");
      // Update token from login
      state.farmer.token = res.body.data.token;
    });

    test("Login as customer", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "customer@test.com",
        password: "password123",
      });
      expect(res.status).toBe(200);
      state.customer.token = res.body.data.token;
    });

    test("Login as delivery agent", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "agent@test.com",
        password: "password123",
      });
      expect(res.status).toBe(200);
      state.agent.token = res.body.data.token;
    });

    test("Reject invalid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "farmer@test.com",
        password: "wrongpassword",
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("Reject missing fields", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "farmer@test.com",
      });
      expect(res.status).toBe(400);
    });
  });

  describe("Profile", () => {
    test("Get current user profile", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${state.farmer.token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Ravi Kumar");
      expect(res.body.data.role).toBe("farmer");
    });

    test("Reject unauthenticated access", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });

    test("Update profile", async () => {
      const res = await request(app)
        .put("/api/auth/update-profile")
        .set("Authorization", `Bearer ${state.farmer.token}`)
        .send({ name: "Ravi Kumar Updated" });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Ravi Kumar Updated");
    });

    test("Update password", async () => {
      const res = await request(app)
        .put("/api/auth/update-password")
        .set("Authorization", `Bearer ${state.farmer.token}`)
        .send({
          currentPassword: "password123",
          newPassword: "newpassword456",
        });
      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
      state.farmer.token = res.body.data.token;
    });

    test("Login with new password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "farmer@test.com",
        password: "newpassword456",
      });
      expect(res.status).toBe(200);
      state.farmer.token = res.body.data.token;
    });

    test("Forgot password flow", async () => {
      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "farmer@test.com" });
      expect(res.status).toBe(200);
      expect(res.body.data.resetToken).toBeDefined();

      // Reset password
      const resetRes = await request(app)
        .put(`/api/auth/reset-password/${res.body.data.resetToken}`)
        .send({ password: "password123" }); // Reset back to original
      expect(resetRes.status).toBe(200);
      expect(resetRes.body.data.token).toBeDefined();
      state.farmer.token = resetRes.body.data.token;
    });

    test("Logout", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${state.farmer.token}`);
      expect(res.status).toBe(200);
    });

    // Re-login farmer for subsequent tests
    test("Re-login farmer after logout", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "farmer@test.com",
        password: "password123",
      });
      expect(res.status).toBe(200);
      state.farmer.token = res.body.data.token;
    });
  });
});

/* ═══════════════════════════════════════════════
   PHASE 3: CATEGORIES & PRODUCE
   ═══════════════════════════════════════════════ */
describe("Categories & Produce", () => {
  describe("Categories", () => {
    test("Seed default categories", async () => {
      const res = await request(app).post("/api/produce/categories/seed");
      expect(res.status).toBe(201);
      expect(res.body.data.length).toBeGreaterThan(0);
      state.category.id = res.body.data[0]._id; // "Vegetables"
    });

    test("Reject duplicate seeding", async () => {
      const res = await request(app).post("/api/produce/categories/seed");
      expect(res.status).toBe(400);
    });

    test("Get all categories", async () => {
      const res = await request(app).get("/api/produce/categories");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(8);
    });
  });

  describe("Produce CRUD (Farmer)", () => {
    test("Farmer creates produce listing", async () => {
      const res = await request(app)
        .post("/api/produce")
        .set("Authorization", `Bearer ${state.farmer.token}`)
        .send({
          name: "Organic Tomatoes",
          description: "Fresh organic tomatoes from our farm",
          category: state.category.id,
          price: 40,
          unit: "kg",
          quantityAvailable: 100,
          minimumOrder: 1,
          isOrganic: true,
          growingMethod: "organic",
          tags: ["organic", "tomatoes", "fresh"],
        });
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe("Organic Tomatoes");
      expect(res.body.data.farmer).toBe(state.farmer.id);
      state.produce.id = res.body.data._id;
    });

    test("Farmer creates a second produce", async () => {
      const res = await request(app)
        .post("/api/produce")
        .set("Authorization", `Bearer ${state.farmer.token}`)
        .send({
          name: "Fresh Spinach",
          description: "Farm-fresh spinach bundles",
          category: state.category.id,
          price: 30,
          unit: "bundle",
          quantityAvailable: 50,
          isOrganic: true,
          growingMethod: "organic",
        });
      expect(res.status).toBe(201);
      state.produce2.id = res.body.data._id;
    });

    test("Customer cannot create produce", async () => {
      const res = await request(app)
        .post("/api/produce")
        .set("Authorization", `Bearer ${state.customer.token}`)
        .send({
          name: "Unauthorized",
          description: "Should not work",
          category: state.category.id,
          price: 10,
          unit: "kg",
          quantityAvailable: 10,
        });
      expect(res.status).toBe(403);
    });

    test("Get farmer's own produce", async () => {
      const res = await request(app)
        .get("/api/produce/farmer/me")
        .set("Authorization", `Bearer ${state.farmer.token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });

    test("Update produce listing", async () => {
      const res = await request(app)
        .put(`/api/produce/${state.produce.id}`)
        .set("Authorization", `Bearer ${state.farmer.token}`)
        .send({ price: 45, quantityAvailable: 150 });
      expect(res.status).toBe(200);
      expect(res.body.data.price).toBe(45);
      expect(res.body.data.quantityAvailable).toBe(150);
    });

    test("Toggle produce availability", async () => {
      const res = await request(app)
        .put(`/api/produce/${state.produce.id}/toggle`)
        .set("Authorization", `Bearer ${state.farmer.token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.isAvailable).toBe(false);

      // Toggle back on
      const res2 = await request(app)
        .put(`/api/produce/${state.produce.id}/toggle`)
        .set("Authorization", `Bearer ${state.farmer.token}`);
      expect(res2.body.data.isAvailable).toBe(true);
    });
  });

  describe("Browse Produce (Public)", () => {
    test("Get all available produce", async () => {
      const res = await request(app).get("/api/produce");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(2);
    });

    test("Get produce by ID", async () => {
      const res = await request(app).get(`/api/produce/${state.produce.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Organic Tomatoes");
      expect(res.body.data.farmer).toBeDefined();
    });

    test("Filter by category", async () => {
      const res = await request(app).get(`/api/produce?category=${state.category.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });

    test("Filter by price range", async () => {
      const res = await request(app).get("/api/produce?minPrice=35&maxPrice=50");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe("Organic Tomatoes");
    });

    test("Filter organic produce", async () => {
      const res = await request(app).get("/api/produce?isOrganic=true");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });

    test("Sort by price low to high", async () => {
      const res = await request(app).get("/api/produce?sort=price_low");
      expect(res.status).toBe(200);
      expect(res.body.data[0].price).toBeLessThanOrEqual(res.body.data[1].price);
    });

    test("Pagination works", async () => {
      const res = await request(app).get("/api/produce?page=1&limit=1");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.pagination.pages).toBe(2);
    });

    test("Return 404 for non-existent produce", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/produce/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });
});

/* ═══════════════════════════════════════════════
   PHASE 4: SHOPPING CART
   ═══════════════════════════════════════════════ */
describe("Shopping Cart", () => {
  test("Customer gets empty cart initially", async () => {
    const res = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${state.customer.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(0);
  });

  test("Customer adds item to cart", async () => {
    const res = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${state.customer.token}`)
      .send({ produceId: state.produce.id, quantity: 5 });
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].quantity).toBe(5);
    state.cartItemId = res.body.data.items[0]._id;
  });

  test("Customer adds second item to cart", async () => {
    const res = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${state.customer.token}`)
      .send({ produceId: state.produce2.id, quantity: 3 });
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(2);
  });

  test("Adding same item again increases quantity", async () => {
    const res = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${state.customer.token}`)
      .send({ produceId: state.produce.id, quantity: 2 });
    expect(res.status).toBe(200);
    const item = res.body.data.items.find(
      (i) => i.produce._id === state.produce.id
    );
    expect(item.quantity).toBe(7); // 5 + 2
  });

  test("Update cart item quantity", async () => {
    const res = await request(app)
      .put(`/api/cart/${state.cartItemId}`)
      .set("Authorization", `Bearer ${state.customer.token}`)
      .send({ quantity: 3 });
    expect(res.status).toBe(200);
  });

  test("Get cart with items", async () => {
    const res = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${state.customer.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(2);
    expect(res.body.data.totalAmount).toBeGreaterThan(0);
  });

  test("Remove second item from cart", async () => {
    // Get cart to find second item ID
    const cartRes = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${state.customer.token}`);
    const secondItemId = cartRes.body.data.items.find(
      (i) => i.produce._id === state.produce2.id
    )._id;

    const res = await request(app)
      .delete(`/api/cart/${secondItemId}`)
      .set("Authorization", `Bearer ${state.customer.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
  });

  test("Farmer cannot access cart", async () => {
    const res = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${state.farmer.token}`);
    expect(res.status).toBe(403);
  });

  test("Reject adding non-existent produce", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${state.customer.token}`)
      .send({ produceId: fakeId, quantity: 1 });
    expect(res.status).toBe(404);
  });
});

/* ═══════════════════════════════════════════════
   PHASE 5: ORDER FLOW
   ═══════════════════════════════════════════════ */
describe("Order Flow", () => {
  test("Customer places order from cart", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${state.customer.token}`)
      .send({
        paymentMethod: "cod",
        deliveryAddress: {
          street: "MG Road 10",
          city: "Vellore",
          state: "Tamil Nadu",
          pincode: "632002",
        },
      });
    expect(res.status).toBe(201);
    expect(res.body.data.orderNumber).toBeDefined();
    expect(res.body.data.status).toBe("placed");
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.deliveryFee).toBe(30);
    expect(res.body.data.totalAmount).toBeGreaterThan(0);
    state.order.id = res.body.data._id;
    state.order.number = res.body.data.orderNumber;
  });

  test("Cart is cleared after placing order", async () => {
    const res = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${state.customer.token}`);
    expect(res.body.data.items.length).toBe(0);
  });

  test("Produce stock is reduced", async () => {
    const res = await request(app).get(`/api/produce/${state.produce.id}`);
    // Started at 150, ordered 3 units
    expect(res.body.data.quantityAvailable).toBe(147);
  });

  test("Customer cannot place order with empty cart", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${state.customer.token}`)
      .send({ paymentMethod: "cod" });
    expect(res.status).toBe(400);
  });

  test("Customer can view their orders", async () => {
    const res = await request(app)
      .get("/api/orders/my")
      .set("Authorization", `Bearer ${state.customer.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].orderNumber).toBe(state.order.number);
  });

  test("Farmer can view their incoming orders", async () => {
    const res = await request(app)
      .get("/api/orders/farmer")
      .set("Authorization", `Bearer ${state.farmer.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  test("Customer can get order by ID", async () => {
    const res = await request(app)
      .get(`/api/orders/${state.order.id}`)
      .set("Authorization", `Bearer ${state.customer.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.orderNumber).toBe(state.order.number);
  });

  test("Farmer can get order by ID", async () => {
    const res = await request(app)
      .get(`/api/orders/${state.order.id}`)
      .set("Authorization", `Bearer ${state.farmer.token}`);
    expect(res.status).toBe(200);
  });

  test("Delivery agent cannot access order yet", async () => {
    const res = await request(app)
      .get(`/api/orders/${state.order.id}`)
      .set("Authorization", `Bearer ${state.agent.token}`);
    expect(res.status).toBe(403);
  });

  // Order status transitions
  test("Farmer confirms order (placed -> confirmed)", async () => {
    const res = await request(app)
      .put(`/api/orders/${state.order.id}/status`)
      .set("Authorization", `Bearer ${state.farmer.token}`)
      .send({ status: "confirmed" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("confirmed");
  });

  test("Reject invalid status transition", async () => {
    const res = await request(app)
      .put(`/api/orders/${state.order.id}/status`)
      .set("Authorization", `Bearer ${state.farmer.token}`)
      .send({ status: "delivered" });
    expect(res.status).toBe(400);
  });

  test("Farmer marks preparing (confirmed -> preparing)", async () => {
    const res = await request(app)
      .put(`/api/orders/${state.order.id}/status`)
      .set("Authorization", `Bearer ${state.farmer.token}`)
      .send({ status: "preparing" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("preparing");
  });

  test("Farmer marks ready for pickup (preparing -> ready_for_pickup)", async () => {
    const res = await request(app)
      .put(`/api/orders/${state.order.id}/status`)
      .set("Authorization", `Bearer ${state.farmer.token}`)
      .send({ status: "ready_for_pickup" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("ready_for_pickup");
  });
});

/* ═══════════════════════════════════════════════
   PHASE 6: DELIVERY FLOW
   ═══════════════════════════════════════════════ */
describe("Delivery Flow", () => {
  test("Delivery agent toggles availability", async () => {
    const res = await request(app)
      .put("/api/delivery/toggle-availability")
      .set("Authorization", `Bearer ${state.agent.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.isAvailable).toBeDefined();
  });

  test("Delivery agent updates location", async () => {
    const res = await request(app)
      .put("/api/delivery/location")
      .set("Authorization", `Bearer ${state.agent.token}`)
      .send({ latitude: 12.9716, longitude: 79.1590 });
    expect(res.status).toBe(200);
  });

  test("Delivery agent sees available orders", async () => {
    const res = await request(app)
      .get("/api/delivery/available-orders")
      .set("Authorization", `Bearer ${state.agent.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].status).toBe("ready_for_pickup");
  });

  test("Delivery agent accepts delivery", async () => {
    const res = await request(app)
      .put(`/api/delivery/accept/${state.order.id}`)
      .set("Authorization", `Bearer ${state.agent.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.order.status).toBe("picked_up");
    expect(res.body.data.delivery).toBeDefined();
    expect(res.body.data.delivery.earnings).toBeGreaterThan(0);
    state.delivery.id = res.body.data.delivery._id;
  });

  test("No more available orders after accepting", async () => {
    const res = await request(app)
      .get("/api/delivery/available-orders")
      .set("Authorization", `Bearer ${state.agent.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });

  test("Get active deliveries", async () => {
    const res = await request(app)
      .get("/api/delivery/my-deliveries?status=active")
      .set("Authorization", `Bearer ${state.agent.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  test("Update delivery status: accepted -> picked_up", async () => {
    const res = await request(app)
      .put(`/api/delivery/${state.delivery.id}/status`)
      .set("Authorization", `Bearer ${state.agent.token}`)
      .send({ status: "picked_up" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("picked_up");
  });

  test("Update delivery status: picked_up -> in_transit", async () => {
    const res = await request(app)
      .put(`/api/delivery/${state.delivery.id}/status`)
      .set("Authorization", `Bearer ${state.agent.token}`)
      .send({ status: "in_transit" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("in_transit");
  });

  test("Update delivery status: in_transit -> delivered", async () => {
    const res = await request(app)
      .put(`/api/delivery/${state.delivery.id}/status`)
      .set("Authorization", `Bearer ${state.agent.token}`)
      .send({ status: "delivered" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("delivered");
    expect(res.body.data.deliveredAt).toBeDefined();
  });

  test("Order is also marked delivered", async () => {
    const res = await request(app)
      .get(`/api/orders/${state.order.id}`)
      .set("Authorization", `Bearer ${state.customer.token}`);
    expect(res.body.data.status).toBe("delivered");
    expect(res.body.data.deliveredAt).toBeDefined();
  });

  test("Delivery agent can see completed deliveries", async () => {
    const res = await request(app)
      .get("/api/delivery/my-deliveries?status=completed")
      .set("Authorization", `Bearer ${state.agent.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  test("Get delivery earnings", async () => {
    const res = await request(app)
      .get("/api/delivery/earnings?period=today")
      .set("Authorization", `Bearer ${state.agent.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.period.earnings).toBeGreaterThan(0);
    expect(res.body.data.period.deliveries).toBe(1);
  });

  test("Get delivery dashboard stats", async () => {
    const res = await request(app)
      .get("/api/delivery/stats")
      .set("Authorization", `Bearer ${state.agent.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.totalDeliveries).toBe(1);
    expect(res.body.data.totalEarnings).toBeGreaterThan(0);
  });
});

/* ═══════════════════════════════════════════════
   PHASE 7: REVIEWS
   ═══════════════════════════════════════════════ */
describe("Reviews", () => {
  test("Customer submits review for delivered order", async () => {
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${state.customer.token}`)
      .send({
        orderId: state.order.id,
        rating: 5,
        comment: "Amazing fresh tomatoes! Will order again.",
      });
    expect(res.status).toBe(201);
    expect(res.body.data.rating).toBe(5);
    expect(res.body.data.isVerified).toBe(true);
    state.review.id = res.body.data._id;
  });

  test("Reject duplicate review", async () => {
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${state.customer.token}`)
      .send({
        orderId: state.order.id,
        rating: 4,
        comment: "Duplicate",
      });
    expect(res.status).toBe(400);
  });

  test("Get farmer reviews", async () => {
    const res = await request(app).get(`/api/reviews/farmer/${state.farmer.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].rating).toBe(5);
    expect(res.body.distribution).toBeDefined();
  });

  test("Get produce reviews", async () => {
    const res = await request(app).get(`/api/reviews/produce/${state.produce.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });
});

/* ═══════════════════════════════════════════════
   PHASE 8: ORDER CANCELLATION (separate order)
   ═══════════════════════════════════════════════ */
describe("Order Cancellation", () => {
  let cancelOrderId;

  test("Setup: add item to cart and place new order", async () => {
    // Add to cart
    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${state.customer.token}`)
      .send({ produceId: state.produce2.id, quantity: 2 });

    // Place order
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${state.customer.token}`)
      .send({ paymentMethod: "cod" });
    expect(res.status).toBe(201);
    cancelOrderId = res.body.data._id;
  });

  test("Customer cancels placed order", async () => {
    const res = await request(app)
      .put(`/api/orders/${cancelOrderId}/cancel`)
      .set("Authorization", `Bearer ${state.customer.token}`)
      .send({ reason: "Changed my mind" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("cancelled");
    expect(res.body.data.cancellationReason).toBe("Changed my mind");
  });

  test("Stock is restored after cancellation", async () => {
    const res = await request(app).get(`/api/produce/${state.produce2.id}`);
    expect(res.body.data.quantityAvailable).toBe(50); // back to original
  });

  test("Cannot cancel a delivered order", async () => {
    const res = await request(app)
      .put(`/api/orders/${state.order.id}/cancel`)
      .set("Authorization", `Bearer ${state.customer.token}`);
    expect(res.status).toBe(400);
  });
});

/* ═══════════════════════════════════════════════
   PHASE 9: ANALYTICS
   ═══════════════════════════════════════════════ */
describe("Analytics", () => {
  test("Farmer gets sales analytics", async () => {
    const res = await request(app)
      .get("/api/analytics/farmer")
      .set("Authorization", `Bearer ${state.farmer.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.revenue).toBeDefined();
    expect(res.body.data.ordersByStatus).toBeDefined();
  });

  test("Customer gets spending analytics", async () => {
    const res = await request(app)
      .get("/api/analytics/customer")
      .set("Authorization", `Bearer ${state.customer.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  test("Customer cannot access farmer analytics", async () => {
    const res = await request(app)
      .get("/api/analytics/farmer")
      .set("Authorization", `Bearer ${state.customer.token}`);
    expect(res.status).toBe(403);
  });
});

/* ═══════════════════════════════════════════════
   PHASE 10: SMART INSIGHTS
   ═══════════════════════════════════════════════ */
describe("Smart Insights", () => {
  test("Farmer gets demand forecast", async () => {
    const res = await request(app)
      .get("/api/smart/demand-forecast")
      .set("Authorization", `Bearer ${state.farmer.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.forecasts).toBeDefined();
    expect(res.body.data.summary).toBeDefined();
  });

  test("Farmer gets price suggestions", async () => {
    const res = await request(app)
      .get("/api/smart/price-suggestions")
      .set("Authorization", `Bearer ${state.farmer.token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("Customer gets recommendations", async () => {
    const res = await request(app)
      .get("/api/smart/recommendations")
      .set("Authorization", `Bearer ${state.customer.token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("Customer cannot access farmer-only smart routes", async () => {
    const res = await request(app)
      .get("/api/smart/demand-forecast")
      .set("Authorization", `Bearer ${state.customer.token}`);
    expect(res.status).toBe(403);
  });
});

/* ═══════════════════════════════════════════════
   PHASE 11: NOTIFICATIONS
   ═══════════════════════════════════════════════ */
describe("Notifications", () => {
  test("Farmer gets notifications (from order placement)", async () => {
    const res = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${state.farmer.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    state.notification.id = res.body.data[0]._id;
  });

  test("Get unread notification count", async () => {
    const res = await request(app)
      .get("/api/notifications/unread-count")
      .set("Authorization", `Bearer ${state.farmer.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.count).toBeGreaterThan(0);
  });

  test("Mark notification as read", async () => {
    const res = await request(app)
      .put(`/api/notifications/${state.notification.id}/read`)
      .set("Authorization", `Bearer ${state.farmer.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.isRead).toBe(true);
  });

  test("Mark all as read", async () => {
    const res = await request(app)
      .put("/api/notifications/read-all")
      .set("Authorization", `Bearer ${state.farmer.token}`);
    expect(res.status).toBe(200);
  });

  test("Unread count is now zero", async () => {
    const res = await request(app)
      .get("/api/notifications/unread-count")
      .set("Authorization", `Bearer ${state.farmer.token}`);
    expect(res.body.data.count).toBe(0);
  });

  test("Customer gets notifications (from status updates)", async () => {
    const res = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${state.customer.token}`);
    expect(res.status).toBe(200);
    // Should have notifications from order status updates
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

/* ═══════════════════════════════════════════════
   PHASE 12: PRODUCE DELETION
   ═══════════════════════════════════════════════ */
describe("Produce Deletion", () => {
  test("Other farmer cannot delete someone else's produce", async () => {
    // Register another farmer
    const regRes = await request(app).post("/api/auth/register").send({
      name: "Other Farmer",
      email: "other@test.com",
      password: "password123",
      phone: "9876543299",
      role: "farmer",
    });

    const res = await request(app)
      .delete(`/api/produce/${state.produce2.id}`)
      .set("Authorization", `Bearer ${regRes.body.data.token}`);
    expect(res.status).toBe(403);
  });

  test("Farmer deletes own produce", async () => {
    const res = await request(app)
      .delete(`/api/produce/${state.produce2.id}`)
      .set("Authorization", `Bearer ${state.farmer.token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toContain("deleted");
  });

  test("Deleted produce returns 404", async () => {
    const res = await request(app).get(`/api/produce/${state.produce2.id}`);
    expect(res.status).toBe(404);
  });
});

/* ═══════════════════════════════════════════════
   SUMMARY
   ═══════════════════════════════════════════════ */
describe("Test Summary", () => {
  test("All state variables were populated correctly", () => {
    expect(state.farmer.token).toBeDefined();
    expect(state.customer.token).toBeDefined();
    expect(state.agent.token).toBeDefined();
    expect(state.category.id).toBeDefined();
    expect(state.produce.id).toBeDefined();
    expect(state.order.id).toBeDefined();
    expect(state.delivery.id).toBeDefined();
    expect(state.review.id).toBeDefined();
    expect(state.notification.id).toBeDefined();
  });
});
