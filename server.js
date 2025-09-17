// server.js
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 8080;
const studentID = "33273634"

//  Middleware 
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); // <-- put this BEFORE json
app.use(bodyParser.json());
app.use(express.static("public")); // serve static files
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
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
    studentId,
    studentName,
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
    if (!inventoryId || !ingredientName || !userId || !studentId || !studentName)
      throw new Error("Missing required inventory fields");
    this.inventoryId = inventoryId;
    this.studentId = studentId;
    this.studentName = studentName;
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
    studentId: "S-1001",
    studentName: "Sarah Jones",
    userId: "SarahJones-12345678",
    ingredientName: "Fresh Tomatoes",
    quantity: 8,
    unit: "pieces",
    category: "Vegetables",
    purchaseDate: "2025-09-10",
    expirationDate: "2025-09-20",
    location: "Fridge",
    cost: 5.0,
    createdDate: "2025-09-10",
  }),
  new InventoryItem({
    inventoryId: "I-00002",
    studentId: "S-1002",
    studentName: "Mario Rossi",
    userId: "MarioRossi-87654321",
    ingredientName: "Spaghetti Pasta",
    quantity: 2,
    unit: "kg",
    category: "Grains",
    purchaseDate: "2025-09-12",
    expirationDate: "2026-01-01",
    location: "Pantry",
    cost: 3.5,
    createdDate: "2025-09-12",
  }),
];

//  Routes 

// Welcome page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

//Recipe 
app.get(`/recipes-${studentID}`, (req, res) => {
  res.render("recipes", { recipes });
});

app.get(`/recipes/new-${studentID}`, (req, res) => {
  res.render("create-recipe");
});
app.get(`/create-recipe-${studentID}`, (req, res) => {
  res.render("create-recipe");
});
app.get(`/delete-recipe-${studentID}`, (req, res) => {
  res.render("delete-recipe", { recipes });
});

app.post(`/recipes-${studentID}`, (req, res) => {
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
    res.status(404).send("Invalid recipe data");
  }
});

//  Inventory 
app.get(`/inventory-${studentID}`, (req, res) => {
  try {
 
    const sortedInventory = [...inventory].sort((a, b) => {
      if ((a.category || '') === (b.category || '')) return (a.location || '').localeCompare(b.location || '');
      return (a.category || '').localeCompare(b.category || '');
    });

    const totalValue = sortedInventory.reduce((sum, item) => sum + (item.cost || 0), 0);

    res.render("inventory", { inventory: sortedInventory, totalValue });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading inventory page");
  }
});
app.get(`/inventory/new-${studentID}`, (req, res) => {
  res.render("create-inventory");
});
app.get(`/create-inventory-${studentID}`, (req, res) =>{
  res.render("create-inventory")
});
app.get(`/delete-inventory-${studentID}`, (req, res) =>{
  res.render("delete-inventory", { inventory });
});

app.post(`/inventory-${studentID}`, (req, res) => {
  try {
    let {
      inventoryId,
      studentId,
      studentName,
      userId,
      ingredientName,
      quantity,
      unit,
      category,
      purchaseDate,
      expirationDate,
      location,
      cost,
    } = req.body;

    // Validate required fields
    if (!inventoryId || !studentId || !studentName || !userId || !ingredientName) {
      throw new Error("Missing required inventory fields");
    }

    const newItem = new InventoryItem({
      inventoryId: inventoryId.trim(),
      studentId: studentId.trim(),
      studentName: studentName.trim(),
      userId: userId.trim(),
      ingredientName: ingredientName.trim(),
      quantity: parseInt(quantity) || 0,
      unit: unit || "units",
      category: category || "Misc",
      purchaseDate: purchaseDate || new Date().toISOString().split("T")[0],
      expirationDate: expirationDate || null,
      location: location || "Pantry",
      cost: parseFloat(cost) || 0.0,
    });

    inventory.push(newItem);
    res.redirect("/inventory");
  } catch (err) {
    console.error(err);
    res.status(400).send("Invalid inventory data");
  }
});


// Recipe pages 
app.get(`/recipes/edit/:id-${studentID}`, (req, res) => {
  const recipe = recipes.find((r) => r.recipeId === req.params.id);
  if (!recipe) return res.status(404).send("Recipe not found"); //Change later 
  res.render("edit-recipe", { recipe });
});

app.post(`/recipes/edit/:id-${studentID}`, (req, res) => {
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

app.post(`/recipe/delete-${studentID}`, (req, res) => {
  const { recipeId } = req.body;            
  const index = recipe.findIndex(i => i.recipeId === recipeId);

  let feedback;
  if (index !== -1) {
    recipe.splice(index, 1); 
    feedback = { type: "success", message: `Recipe ${recipeId} deleted successfully.` };
  } else {
    feedback = { type: "error", message: `Recipe ${recipeId} not found.` };
  }

  res.render("delete-recipe", { recipe, feedback });
});
// Inventory pages
app.get(`/inventory/edit/:id-${studentID}`, (req, res) => {
  const item = inventory.find(i => i.inventoryId === req.params.id);
  if (!item) return res.status(404).send("Inventory item not found");
  res.render("edit-inventory", { item });
});

app.post(`/inventory/edit/:id-${studentID}`, (req, res) => {
  const item = inventory.find((i) => i.inventoryId === req.params.id);
  if (!item) return res.status(404).send("Inventory item not found");

  item.studentId = req.body.studentId.trim();
  item.studentName = req.body.studentName.trim();
  item.userId = req.body.userId.trim();
  item.ingredientName = req.body.ingredientName.trim();
  item.quantity = parseInt(req.body.quantity) || 0;
  item.unit = req.body.unit.trim();
  item.category = req.body.category.trim();
  item.purchaseDate = req.body.purchaseDate || item.purchaseDate;
  item.expirationDate = req.body.expirationDate || item.expirationDate;
  item.location = req.body.location || item.location;
  item.cost = parseFloat(req.body.cost) || item.cost;

  res.redirect("/inventory");
});

app.post(`/inventory/delete-${studentID}`, (req, res) => {
  const { inventoryId } = req.body;            
  const index = inventory.findIndex(i => i.inventoryId === inventoryId);
  if (index !== -1) inventory.splice(index, 1); 
  res.redirect("/inventory");                   
});

// Utils
class RecipeUtils {
  static addRecipe(list, recipe) {
    list.push(recipe);
    return recipe;
  }
  static updateRecipe(list, recipeId, updates) {
    const recipe = list.find(r => r.recipeId === recipeId);
    if (recipe) Object.assign(recipe, updates);
    return recipe;
  }
  static deleteRecipe(list, recipeId) {
    const index = list.findIndex(r => r.recipeId === recipeId);
    return index !== -1 ? list.splice(index, 1)[0] : null;
  }
}

class InventoryUtils {
  static addItem(list, item) {
    list.push(item);
    return item;
  }
  static updateItem(list, inventoryId, updates) {
    const item = list.find(i => i.inventoryId === inventoryId);
    if (item) Object.assign(item, updates);
    return item;
  }
  static deleteItem(list, inventoryId) {
    const index = list.findIndex(i => i.inventoryId === inventoryId);
    return index !== -1 ? list.splice(index, 1)[0] : null;
  }
}

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
  console.log(`Server running at http://localhost:${PORT}-${studentID}`);
});
