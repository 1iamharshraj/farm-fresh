const Produce = require("../models/Produce");
const Category = require("../models/Category");

// @desc    Create produce listing
// @route   POST /api/produce
// @access  Farmer only
exports.createProduce = async (req, res, next) => {
  try {
    req.body.farmer = req.user._id;

    // Set location from farmer's address if not provided
    if (!req.body.location && req.user.farmDetails?.farmAddress?.coordinates?.coordinates) {
      req.body.location = req.user.farmDetails.farmAddress.coordinates;
    } else if (!req.body.location && req.user.address?.coordinates?.coordinates) {
      req.body.location = req.user.address.coordinates;
    }

    const produce = await Produce.create(req.body);
    await produce.populate("category", "name slug");

    res.status(201).json({
      success: true,
      message: "Produce listed successfully",
      data: produce,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all produce (with filters, search, pagination)
// @route   GET /api/produce
// @access  Public
exports.getAllProduce = async (req, res, next) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      isOrganic,
      growingMethod,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isAvailable: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Search by text
    if (search) {
      query.$text = { $search: search };
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Organic filter
    if (isOrganic === "true") {
      query.isOrganic = true;
    }

    // Growing method filter
    if (growingMethod) {
      query.growingMethod = growingMethod;
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // default: newest
    if (sort === "price_low") sortOption = { price: 1 };
    else if (sort === "price_high") sortOption = { price: -1 };
    else if (sort === "rating") sortOption = { averageRating: -1 };
    else if (sort === "name") sortOption = { name: 1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [produce, total] = await Promise.all([
      Produce.find(query)
        .populate("farmer", "name avatar farmDetails.farmName averageRating")
        .populate("category", "name slug")
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),
      Produce.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: produce,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single produce by ID
// @route   GET /api/produce/:id
// @access  Public
exports.getProduceById = async (req, res, next) => {
  try {
    const produce = await Produce.findById(req.params.id)
      .populate("farmer", "name email phone avatar farmDetails averageRating totalRatings address")
      .populate("category", "name slug");

    if (!produce) {
      return res.status(404).json({ success: false, message: "Produce not found" });
    }

    res.status(200).json({ success: true, data: produce });
  } catch (error) {
    next(error);
  }
};

// @desc    Update produce
// @route   PUT /api/produce/:id
// @access  Farmer (owner only)
exports.updateProduce = async (req, res, next) => {
  try {
    let produce = await Produce.findById(req.params.id);

    if (!produce) {
      return res.status(404).json({ success: false, message: "Produce not found" });
    }

    if (produce.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this listing" });
    }

    produce = await Produce.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    })
      .populate("category", "name slug")
      .populate("farmer", "name avatar farmDetails.farmName");

    res.status(200).json({
      success: true,
      message: "Produce updated",
      data: produce,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete produce
// @route   DELETE /api/produce/:id
// @access  Farmer (owner only)
exports.deleteProduce = async (req, res, next) => {
  try {
    const produce = await Produce.findById(req.params.id);

    if (!produce) {
      return res.status(404).json({ success: false, message: "Produce not found" });
    }

    if (produce.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this listing" });
    }

    await produce.deleteOne();

    res.status(200).json({ success: true, message: "Produce deleted" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get farmer's own produce listings
// @route   GET /api/produce/farmer/me
// @access  Farmer only
exports.getMyProduce = async (req, res, next) => {
  try {
    const produce = await Produce.find({ farmer: req.user._id })
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: produce });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle produce availability
// @route   PUT /api/produce/:id/toggle
// @access  Farmer (owner only)
exports.toggleAvailability = async (req, res, next) => {
  try {
    const produce = await Produce.findById(req.params.id);

    if (!produce) {
      return res.status(404).json({ success: false, message: "Produce not found" });
    }

    if (produce.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    produce.isAvailable = !produce.isAvailable;
    await produce.save();

    res.status(200).json({
      success: true,
      message: `Produce ${produce.isAvailable ? "available" : "unavailable"}`,
      data: produce,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby produce
// @route   GET /api/produce/nearby
// @access  Public
exports.getNearbyProduce = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10, limit = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: "Latitude and longitude required" });
    }

    const produce = await Produce.find({
      isAvailable: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(radius) * 1000, // convert km to meters
        },
      },
    })
      .populate("farmer", "name avatar farmDetails.farmName")
      .populate("category", "name slug")
      .limit(Number(limit));

    res.status(200).json({ success: true, data: produce });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed default categories
// @route   POST /api/categories/seed
// @access  Public (one-time setup)
exports.seedCategories = async (req, res, next) => {
  try {
    const existing = await Category.countDocuments();
    if (existing > 0) {
      return res.status(400).json({ success: false, message: "Categories already seeded" });
    }

    const defaultCategories = [
      { name: "Vegetables", icon: "carrot", description: "Fresh seasonal vegetables" },
      { name: "Fruits", icon: "apple", description: "Farm-fresh fruits" },
      { name: "Dairy", icon: "milk", description: "Milk, curd, butter, paneer" },
      { name: "Grains & Cereals", icon: "wheat", description: "Rice, wheat, millets" },
      { name: "Herbs & Spices", icon: "leaf", description: "Fresh herbs and spices" },
      { name: "Pulses & Lentils", icon: "seed", description: "Dal, chickpeas, beans" },
      { name: "Eggs & Poultry", icon: "egg", description: "Farm eggs and poultry" },
      { name: "Honey & Preserves", icon: "honey", description: "Natural honey and jams" },
    ];

    const categories = await Category.create(defaultCategories);
    res.status(201).json({
      success: true,
      message: `${categories.length} categories seeded`,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};
