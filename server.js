// server.js
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const crypto = require("crypto");

const { connectToMongoDB } = require("./assignment-2/db/connection");
const { isLoggedIn, hasRole } = require("./assignment-2/middleware/authMiddleware")
const User = require("./assignment-2/models/User");
const Recipe = require("./assignment-2/models/Recipe");
const InventoryItem = require("./assignment-2/models/InventoryItem");

const recipeRoutes = require("./assignment-2/routes/recipeRoutes");
const inventoryRoutes = require("./assignment-2/routes/inventoryRoutes");
const userRoutes = require("./assignment-2/routes/userRoutes");

const app = express();
const PORT = 8080;
const studentID = "33273634";
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// ---- Middleware ----
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/bootstrap", express.static(path.join(__dirname, "node_modules/bootstrap/dist")));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }
}));
// ---- View engine ----
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Database connection & seeding
connectToMongoDB()
  .then(async () => {
    console.log("DB is ready!");
    await seedData();
  })
  .catch((err) => {
    console.error("DB connection failed", err);
    process.exit(1);
  });

async function seedData() {
  const existingRecipes = await Recipe.countDocuments();
  if (existingRecipes === 0) {
    await Recipe.insertMany([
      {
        recipeId: "R-00001",
        title: "Classic Spaghetti Carbonara",
        chef: "Hoangle",
        userId: "U-10001",
        ingredients: [
          "400g spaghetti",
          "200g pancetta",
          "4 large eggs",
          "100g Pecorino Romano",
          "Black pepper",
        ],
        instructions: [
          "Boil salted water",
          "Cook pancetta",
          "Whisk eggs with cheese",
          "Combine pasta with pancetta",
          "Add egg mixture off heat",
        ],
        mealType: "Dinner",
        cuisineType: "Italian",
        prepTime: 25,
        difficulty: "Medium",
        servings: 4,
      },
    ]);
    console.log("Sample recipes added");
  }

  const existingInventory = await InventoryItem.countDocuments();
  if (existingInventory === 0) {
    await InventoryItem.insertMany([
      {
      inventoryId: "I-00001",
      userId: "U-10001",
      ingredientName: "Fresh Tomatoes",
      quantity: 8,
      unit: "pieces",
      category: "Vegetables",
      purchaseDate: new Date("2025-09-10"),
      expirationDate: new Date("2025-09-20"),
      location: "Fridge",
      cost: 5.0,
      },
    ]);
    console.log("Sample inventory added");
  }
}

// ---- Routes ----
app.get("/", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const recipeCount = await Recipe.countDocuments();
    const inventoryCount = await InventoryItem.countDocuments();

    let user = null;
    if (req.session && req.session.userId) {
      user = await User.findOne({ userId: req.session.userId }).select("fullname email");
    }

    res.render("index", {
      studentID,
      user,
      stats: {
        users: userCount,
        recipes: recipeCount,
        inventory: inventoryCount,
      },
    });
  } catch (err) {
    console.error("Error loading homepage:", err);
    res.status(500).send("Server error");
  }
});

// mount feature routes
app.use("/", userRoutes);
app.use("/", recipeRoutes(studentID, isLoggedIn));
app.use("/", inventoryRoutes(studentID, isLoggedIn));

// ---- Error handling ----
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(400).sendFile(__dirname + "/error/invalid.html");
});
app.use((req, res) => {
  res.status(404).sendFile(__dirname + "/error/404.html");
});

// ---- Start server ----
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}-${studentID}`);
});
