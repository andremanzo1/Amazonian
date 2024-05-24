const express = require("express");
const mysql = require("mysql");
const app = express();
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const bcrypt = require("bcrypt");
const pool = dbConnection();
const sessionStore = new MySQLStore({}, pool);
app.set("trust proxy", 1); // trust first proxy

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: { secure: false },
  }),
);

app.set("view engine", "ejs");
app.use(express.static("public"));
//to parse Form data sent using POST method
app.use(express.urlencoded({ extended: true }));

//routes
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

//Userhome
app.get("/UserHome", (req, res) => {
  let username = req.session.UserName;
  res.render("Userhome", { username: username });
});

//Adminhome
app.get("/Adminhome", (req, res) => {
  res.render("AdminHome");
});

//Display registered Users from the admin side
app.get("/DisplayUsers", async (req, res) => {
  let sql = `SELECT * FROM Customers`;
  let rows = await executeSQL(sql);
  res.render("DisplayUsers", { users: rows });
});

// Option to delete a user
app.get("/DeleteUser", async (req, res) => {
  let deleteId = req.query.CustomerID;
  let sql = `DELETE FROM Customers WHERE CustomerID = ?`;

  let params = [deleteId];
  let rows = await executeSQL(sql, params);
  res.redirect("/DisplayUsers");
});

//option to add products to the store
app.get("/addProduct", (req, res) => {
  res.render("newProduct");
});

app.post("/addProduct", async (req, res) => {
  let Name = req.body.Name;
  let Description = req.body.Description;
  let Price = req.body.Price;
  let QuantityAvailable = req.body.QuantityAvailable;
  let Category = req.body.Category;
  let Supplier = req.body.Supplier;
  let Image = req.body.Image;

  let query = `INSERT INTO Products (Name, Description, Price, QuantityAvailable, Category, Supplier, Image ) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  let params = [
    Name,
    Description,
    Price,
    QuantityAvailable,
    Category,
    Supplier,
    Image,
  ];
  let result = await executeSQL(query, params);
  console.log(result);
  res.redirect("/addProduct");
});

//Display list products from the admin side
app.get("/productList", async (req, res) => {
  let sql = `SELECT * FROM Products ORDER BY Name`;

  let rows = await executeSQL(sql);
  res.render("productList", { productList: rows });
});

//Display form to update product
app.get("/updateProduct", async (req, res) => {
  let id = req.query.ProductID;

  let sql = `SELECT *
              FROM Products
              WHERE ProductID = ?`;
  let rows = await executeSQL(sql, [id]);
  res.render("updateProduct", { productInfo: rows[0] });
});
//Updates product info
app.post("/updateProduct", async (req, res) => {
  let id = req.body.ProductID;
  let Name = req.body.Name;
  let Description = req.body.Description;
  let Price = req.body.Price;
  let QuantityAvailable = req.body.QuantityAvailable;
  let Category = req.body.Category;
  let Supplier = req.body.Supplier;
  let Image = req.body.Image;
  let sql = `UPDATE Products
              SET Name = ?,
              Description = ?,
              Price = ?,
              QuantityAvailable = ?,
              Category=?,
              Supplier=?,
              Image=?
              WHERE ProductID = ?`;
  let params = [
    Name,
    Description,
    Price,
    QuantityAvailable,
    Category,
    Supplier,
    Image,
    id,
  ];
  let rows = await executeSQL(sql, params);

  res.redirect("/productList");
});

// Option to delete a product
app.get("/DeleteProduct", async (req, res) => {
  let deleteId = req.query.ProductID;
  let sql = `DELETE FROM Products WHERE ProductID = ?`;

  let params = [deleteId];
  let rows = await executeSQL(sql, params);
  res.redirect("/productList");
});

//Login
app.get("/Login", (req, res) => {
  res.render("LoginUser");
});

app.post("/Login", async (req, res) => {
  let UserName = req.body.UserName;
  let Password = req.body.Password;

  if (!UserName || !Password) {
    // If any required field is missing, redirect back to create account page
    return res.render("LoginUser");
  }

  try {
    let query = `SELECT CustomerID, UserName, IsAdmin , Password
                FROM Customers 
                WHERE UserName = ?`;

    let params = [UserName];

    let result = await executeSQL(query, params);
    if (result.length > 0) {
      const hashedPassword = result[0].Password;

      // Compare the hashed password with the password provided by the user
      const passwordMatch = await bcrypt.compare(Password, hashedPassword);

      if (passwordMatch) {
        req.session.CustomerID = result[0].CustomerID;
        req.session.UserName = result[0].UserName;
        // If passwords match, the user is authenticated
        if (result[0].IsAdmin === 1) {
          // If user is admin, render the AdminHome page
          return res.redirect("/Adminhome");
        } else {
          // If user is not an admin, redirect to UserHome page with the username parameter
          return res.redirect(
            "/UserHome?username=" + encodeURIComponent(UserName),
          );
        }
      } else {
        // If passwords don't match, render the login page
        return res.render("LoginUser");
      }
    } else {
      // If no matching user is found, render the login page
      return res.render("LoginUser");
    }
  } catch (error) {
    return res.render("LoginUser");
  }
});

// Create Account
app.get("/CreateAccount", async (req, res) => {
  res.render("newUser");
});

app.post("/CreateAccount", async (req, res) => {
  let UserName = req.body.UserName;
  let FirstName = req.body.FirstName;
  let LastName = req.body.LastName;
  let Email = req.body.Email;
  let Password = req.body.Password;
  let Address = req.body.Address;
  let City = req.body.City;
  let State = req.body.State;
  let ZipCode = req.body.ZipCode;
  let Country = req.body.Country;
  let Phone = req.body.Phone;

  if (
    !UserName ||
    !FirstName ||
    !LastName ||
    !Email ||
    !Password ||
    !Address ||
    !City ||
    !State ||
    !ZipCode ||
    !Country ||
    !Phone
  ) {
    // If any required field is missing, redirect back to create account page
    return res.render("newUser");
  }

  try {
    //To check if the username has been taken or not
    let check = `SELECT COUNT(*) AS count FROM Customers WHERE UserName = ?`;
    let checkParam = [UserName];
    let checkResult = await executeSQL(check, checkParam);
    if (checkResult[0].count > 0) {
      // If the username already exists, it will redirect back to create account page
      return res.render("newUser");
    }

    const hashedPassword = await bcrypt.hash(Password, 10);
    let query = `INSERT INTO Customers (UserName, FirstName, LastName, Email, Password, Address, City, State, ZipCode, Country, Phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    let params = [
      UserName,
      FirstName,
      LastName,
      Email,
      hashedPassword,
      Address,
      City,
      State,
      ZipCode,
      Country,
      Phone,
    ];

    let result = await executeSQL(query, params);
    // If the account is successfully created, render the Userhome view
    req.session.CustomerID = result.insertId;
    req.session.UserName = UserName;
    res.redirect("/UserHome?username=" + encodeURIComponent(UserName));
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.redirect("newUser");
    }
    res.render("newUser");
  }
});

app.get("/viewProducts", async (req, res) => {
  let sql = `SELECT * FROM Products WHERE QuantityAvailable > 0 ORDER BY Name`;
  let rows = await executeSQL(sql);
  res.render("viewProducts", { productList: rows });
});

app.get("/viewCart", async (req, res) => {
  let customerID = req.session.CustomerID;
  let sql = `SELECT Products.Name, Products.Description, Products.Price, ShoppingCart.Quantity, Products.ProductID
             FROM ShoppingCart
             JOIN Products ON ShoppingCart.ProductID = Products.ProductID
             WHERE ShoppingCart.CustomerID = ?`;
  let rows = await executeSQL(sql, [customerID]);
  res.render("viewCart", { cartItems: rows });
});
//delete product from cart
app.get("/DeleteProductInCart", async (req, res) => {
  let customerID = req.session.CustomerID;
  let ProductID = req.query.ProductID;
  let sql = `DELETE FROM ShoppingCart WHERE CustomerID = ? AND ProductID = ?`;
  

  let params = [customerID, ProductID];
  let rows = await executeSQL(sql, params);
  res.redirect("/viewCart");
});

app.post("/addToCart", async (req, res) => {
  let customerID = req.session.CustomerID;
  let productID = req.body.ProductID;
  let quantity = parseInt(req.body.Quantity);
  let productSql = `SELECT QuantityAvailable
                    FROM Products 
                    WHERE ProductID = ?`;
  let product = await executeSQL(productSql, [productID]);

  if (product.length > 0 && product[0].QuantityAvailable >= quantity) {
    let newQuantity = product[0].QuantityAvailable - quantity;
      let updateProductSql = `UPDATE Products
                              SET QuantityAvailable = ?
                            WHERE ProductID = ?`;
      await executeSQL(updateProductSql, [newQuantity, productID]);
    let checkCartSql = `SELECT *
                        FROM ShoppingCart
                        WHERE CustomerID = ?
                        AND ProductID = ?`;
    let cartItem = await executeSQL(checkCartSql, [customerID, productID]);

    if (cartItem.length > 0) {
      let newCartQuantity = parseInt(cartItem[0].Quantity) + quantity;
      let updateCartSql = `UPDATE ShoppingCart
                         SET Quantity = ?
                         WHERE CustomerID = ?
                         AND ProductID = ?`;
      await executeSQL(updateCartSql, [newCartQuantity, customerID, productID]);
    } else {
      let addCartSql = `INSERT INTO ShoppingCart (CustomerID, ProductID, Quantity) VALUES (?, ?, ?)`;
      await executeSQL(addCartSql, [customerID, productID, quantity]);
    }
    res.redirect("/viewProducts");
  }
});

app.post("/checkout", async (req, res) => {
  let customerID = req.session.CustomerID;
  let sql = `DELETE 
             FROM ShoppingCart 
             WHERE CustomerID = ?`;
  await executeSQL(sql, [customerID]);
  res.render("orderConfirm");
});

app.get("/dbTest", async function (req, res) {
  let sql = "SELECT CURDATE()";
  let rows = await executeSQL(sql);
  res.send(rows);
}); //dbTest

//functions
async function executeSQL(sql, params) {
  return new Promise(function (resolve, reject) {
    pool.query(sql, params, function (err, rows, fields) {
      if (err) throw err;
      resolve(rows);
    });
  });
} //executeSQL
//values in red must be updated
function dbConnection() {
  const pool = mysql.createPool({
    connectionLimit: 10,
    host: "wm63be5w8m7gs25a.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "ct66i9sfgn5eot0d",
    password: "ogicf62m9waw6gga",
    database: "e94hmvgxib7qgtfn",
  });

  return pool;
} //dbConnection

//start server
app.listen(3000, () => {
  console.log("Expresss server running...");
});