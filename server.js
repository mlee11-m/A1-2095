// server.js
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 8080;

//  Middleware 
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); // <-- put this BEFORE json
app.use(bodyParser.json());
app.use(express.static("public")); // serve static files

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Data Models 
class Recipe {
  constructor({
    recipeId,
    title,
    chef,
    ingredients,
    instructions,
    mealType,
    cuisineType,
    prepTime,
    difficulty,
    servings,
    createdDate,
  }) {
    if (!recipeId || !title || !chef)
      throw new Error("Missing required recipe fields");
    this.recipeId = recipeId;
    this.title = title;
    this.chef = chef;
    this.ingredients = ingredients || [];
    this.instructions = instructions || [];
    this.mealType = mealType || "Other";
    this.cuisineType = cuisineType || "General";
    this.prepTime = prepTime || 0;
    this.difficulty = difficulty || "Easy";
    this.servings = servings || 1;
    this.createdDate = createdDate || new Date().toISOString().split("T")[0];
  }
}

class InventoryItem {
  constructor({
    inventoryId,
    userId,
    ingredientName,
    quantity,
    unit,
    category,
    purchaseDate,
    expirationDate,
    location,
    cost,
    createdDate,
  }) {
    if (!inventoryId || !ingredientName || !userId)
      throw new Error("Missing required inventory fields");
    this.inventoryId = inventoryId;
    this.userId = userId;
    this.ingredientName = ingredientName;
    this.quantity = quantity || 0;
    this.unit = unit || "units";
    this.category = category || "Misc";
    this.purchaseDate = purchaseDate || new Date().toISOString().split("T")[0];
    this.expirationDate = expirationDate || null;
    this.location = location || "Pantry";
    this.cost = cost || 0.0;
    this.createdDate = createdDate || new Date().toISOString().split("T")[0];
  }
}

// Sample Data 
let recipes = [
  new Recipe({
    recipeId: "R-00003",
    title: "Classic Spaghetti Carbonara",
    chef: "Hoangle-33273634",
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
  }),
  new Recipe({
    recipeId: "R-00002",
    title: "Avocado Toast Supreme",
    chef: "SarahJones-12345678",
    ingredients: [
      "2 slices sourdough bread",
      "1 ripe avocado",
      "1 tomato",
      "Feta cheese",
      "Olive oil",
      "Lemon juice",
    ],
    instructions: [
      "Toast bread",
      "Mash avocado with lemon",
      "Slice tomato",
      "Spread avocado",
      "Top with tomato and feta",
    ],
    mealType: "Breakfast",
    cuisineType: "Mediterranean",
    prepTime: 10,
    difficulty: "Easy",
    servings: 2,
  }),
];

let inventory = [
  new InventoryItem({
    inventoryId: "I-00001",
    userId: "SarahJones-12345678",
    ingredientName: "Fresh Tomatoes",
    quantity: 8,
    unit: "pieces",
    category: "Vegetables",
  }),
  new InventoryItem({
    inventoryId: "I-00002",
    userId: "MarioRossi-87654321",
    ingredientName: "Spaghetti Pasta",
    quantity: 2,
    unit: "kg",
    category: "Grains",
  }),
];

//  Routes 

// Welcome page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

//Recipe 
app.get("/recipes", (req, res) => {
  res.render("recipes", { recipes });
});

app.get("/recipes/new", (req, res) => {
  res.render("create-recipe");
});
app.get("/create-recipe", (req, res) => {
  res.render("create-recipe");
});

app.post("/recipes", (req, res) => {
  try {
    let {
      title,
      chef,
      ingredients,
      instructions,
      mealType,
      cuisineType,
      prepTime,
      difficulty,
      servings,
    } = req.body;

    title = title?.trim();
    chef = chef?.trim();

    if (!title || !chef || !ingredients || !instructions) {
      throw new Error("Missing required fields");
    }

    const newId = `R-${(recipes.length + 1).toString().padStart(5, "0")}`;

    const newRecipe = new Recipe({
      recipeId: newId,
      title,
      chef,
      ingredients: ingredients
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean),
      instructions: instructions
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean),
      mealType: mealType || "Other",
      cuisineType: cuisineType || "General",
      prepTime: parseInt(prepTime) || 0,
      difficulty: difficulty || "Easy",
      servings: parseInt(servings) || 1,
      createdDate: new Date().toISOString().split("T")[0],
    });

    recipes.push(newRecipe);
    res.redirect("/recipes");
  } catch (err) {
    console.error(err);
    res.status(400).send("Invalid recipe data");
  }
});

//  Inventory 
app.get("/inventory", (req, res) => {
  res.render("inventory", { inventory });
});

app.get("/inventory/new", (req, res) => {
  res.render("create-inventory");
});
app.get("/create-inventory", (req, res) =>{
  res.render("create-inventory")
});

app.post("/inventory", (req, res) => {
  try {
    let { inventoryId, userId, ingredientName, quantity, unit, category } = req.body;

    // Trim strings to avoid empty spaces
    inventoryId = inventoryId?.trim();
    userId = userId?.trim();
    ingredientName = ingredientName?.trim();


    if (!inventoryId || !userId || !ingredientName) {
      throw new Error("Missing required inventory fields");
    }

    const newItem = new InventoryItem({
      inventoryId,
      userId,
      ingredientName,
      quantity: parseInt(quantity) || 0,
      unit: unit || "units",
      category: category || "Misc",
    });

    inventory.push(newItem);
    res.redirect("/inventory"); // redirect to inventory list page
  } catch (err) {
    console.error(err);
    res.status(400).send("Invalid inventory data");
  }
});

// Recipe pages 
app.get("/recipes/edit/:id", (req, res) => {
  const recipe = recipes.find((r) => r.recipeId === req.params.id);
  if (!recipe) return res.status(404).send("Recipe not found");
  res.render("edit-recipe", { recipe });
});

app.post("/recipes/edit/:id", (req, res) => {
  const recipe = recipes.find((r) => r.recipeId === req.params.id);
  if (recipe) {
    recipe.title = req.body.title.trim();
    recipe.chef = req.body.chef.trim();
    recipe.ingredients = req.body.ingredients
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);
    recipe.instructions = req.body.instructions
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);
    recipe.mealType = req.body.mealType;
    recipe.cuisineType = req.body.cuisineType;
    recipe.prepTime = parseInt(req.body.prepTime);
    recipe.difficulty = req.body.difficulty;
    recipe.servings = parseInt(req.body.servings);
  }
  res.redirect("/recipes");
});

app.post("/recipes/delete/:id", (req, res) => {
  const index = recipes.findIndex((r) => r.recipeId === req.params.id);
  if (index !== -1) recipes.splice(index, 1);
  res.redirect("/recipes");
});

// Inventory pages
app.get("/inventory/edit/:id", (req, res) => {
  const item = inventory.find(i => i.inventoryId === req.params.id);
  if (!item) return res.status(404).send("Inventory item not found");
  res.render("edit-inventory", { item });
});

app.post("/inventory/edit/:id", (req, res) => {
  const item = inventory.find(i => i.inventoryId === req.params.id);
  if (item) {
    item.ingredientName = req.body.ingredientName.trim();
    item.quantity = parseInt(req.body.quantity);
    item.unit = req.body.unit.trim();
    item.category = req.body.category.trim();
    item.userId = req.body.userId.trim();
  }
  res.redirect("/inventory");
});

app.post("/inventory/delete/:id", (req, res) => {
  const index = inventory.findIndex(i => i.inventoryId === req.params.id);
  if (index !== -1) inventory.splice(index, 1);
  res.redirect("/inventory");
});
//  Error Handling 
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(400).sendFile(__dirname + "/error/invalid.html");
});

app.use((req, res) => {
  res.status(404).sendFile(__dirname + "/error/404.html");
});

// Start Server 
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
