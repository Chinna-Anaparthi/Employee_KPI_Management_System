const Database_Kpi = require("./kpiDatabase");
const Adminvalidations = require("./Validations/AdminValidations");
const jwt = require("jsonwebtoken");
const secretKey = "chinna";
//Admin-Data
const AdminPost = (req, res) => {
  const validation = Adminvalidations.validate(req.body);
  if (validation.error) {
    res.status(400).json({ error: validation.error.details[0].message });
  } else {
    const query =
      "INSERT INTO adminregister_data(adminID, adminName, adminEmail, adminPassword) VALUES ('" +
      req.body.adminID +
      "','" +
      req.body.adminName +
      "','" +
      req.body.adminEmail +
      "','" +
      req.body.adminPassword +
      "')";
    Database_Kpi.query(query, (err, resp) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json({ message: "Admin Sucessfully registered." });
      }
    });
  }
};
const AdminloginPost = (req, res) => {
  const query =
    "SELECT * FROM adminregister_data WHERE adminEmail = '" +
    req.body.adminEmail +
    "' AND adminPassword = '" +
    req.body.adminPassword +
    "'";
  Database_Kpi.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ error: "An error occurred while logging in" });
    } else {
      if (results.length > 0) {
        const user = results[0];
        const payload = {
          adminID: user.adminID,
          adminName: user.adminName,
          adminEmail: user.adminEmail,
          adminPassword: user.adminPassword,
        };
        jwt.sign(payload, secretKey, { expiresIn: "1hr" }, (err, token) => {
          if (err) {
            res
              .status(500)
              .json({ error: "An error occurred while generating token" });
          } else {
            res.status(200).json({ message: "Admin Login successful", token });
          }
        });
      } else {
        res.status(401).json({ message: "Admin not found" });
      }
    }
  });
};
const Admin_Employee_Insert_Data = (req, res) => {
  try {
    const data = req.body;
    if (Array.isArray(data) && data.length > 0) {
      for (const entry of data) {
        const adminID = entry.adminID;
        const entryData = entry.data;
        if (Array.isArray(entryData) && entryData.length > 0) {
          for (const categoryData of entryData) {
            for (const entry in data) {
              const adminID = data[entry].adminID;

              for (const categoryData of data[entry].data) {
                for (const categoryName in categoryData) {
                  const subcategories = categoryData[categoryName];

                  for (const subcategory of subcategories) {
                    const subcategoryName = subcategory.Name;

                    if (subcategory.Questions && subcategory.QuantityTarget) {
                      for (let i = 0; i < subcategory.Questions.length; i++) {
                        const question = subcategory.Questions[i];
                        const quantityTarget = subcategory.QuantityTarget[i];
                        const checkQuery = `SELECT * FROM admin_data_employee_table WHERE adminID = ? AND Category = ? AND Name = ? AND Questions = ?`;
                        Database_Kpi.query(
                          checkQuery,
                          [adminID, categoryName, subcategoryName, question],
                          (err, results) => {
                            if (err) {
                              console.error(err);
                            } else {
                              if (results.length > 0) {
                                const updateQuery = `UPDATE admin_data_employee_table SET QuantityTarget = ? WHERE adminID = ? AND Category = ? AND Name = ? AND Questions = ?`;
                                Database_Kpi.query(
                                  updateQuery,
                                  [
                                    quantityTarget,
                                    adminID,
                                    categoryName,
                                    subcategoryName,
                                    question,
                                  ],
                                  (err, results) => {
                                    if (err) {
                                      console.error(err);
                                    }
                                  }
                                );
                              } else {
                                const insertQuery = `INSERT INTO admin_data_employee_table (adminID, Category, Name, Questions, QuantityTarget) VALUES (?, ?, ?, ?, ?)`;
                                Database_Kpi.query(
                                  insertQuery,
                                  [
                                    adminID,
                                    categoryName,
                                    subcategoryName,
                                    question,
                                    quantityTarget,
                                  ],
                                  (err, results) => {
                                    if (err) {
                                      console.error(err);
                                    }
                                  }
                                );
                              }
                            }
                          }
                        );
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return res
      .status(201)
      .json({ message: "admin employee metric insert successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
};
const Admin_Employee_Retrive_Data = (req, res) => {
  try {
    const responseData = {};

    const query = "SELECT * FROM admin_data_employee_table";
    Database_Kpi.query(query, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "An error occurred" });
      }

      results.forEach((row) => {
        const { Category, Name, Questions, QuantityTarget } = row;

        if (!responseData[Category]) {
          responseData[Category] = [];
        }

        const existingCategory = responseData[Category].find(
          (item) => item.Name === Name
        );

        if (!existingCategory) {
          responseData[Category].push({
            Name,
            Questions: Questions ? Questions.split("\n") : [],
            QuantityTarget: QuantityTarget ? [QuantityTarget] : [],
          });
        } else {
          existingCategory.Questions = [
            ...existingCategory.Questions,
            ...(Questions ? Questions.split("\n") : []),
          ];
          existingCategory.QuantityTarget = [
            ...existingCategory.QuantityTarget,
            QuantityTarget,
          ];
        }
      });

      return res.status(200).json(responseData);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
};
const Admin_Employee_Delete_Data = (req, res) => {
  const { adminID, category, name, questions } = req.params;

  if (!adminID) {
    return res.status(400).json({ error: "Invalid adminID provided" });
  }

  let deleteQuery = `
        DELETE FROM admin_data_employee_table 
        WHERE adminID = ?`;
  const queryParams = [adminID];

  if (category) {
    deleteQuery += " AND Category = ?";
    queryParams.push(category);
  }

  if (name) {
    deleteQuery += " AND Name = ?";
    queryParams.push(name);
  }

  if (questions) {
    deleteQuery += " AND questions = ?";
    queryParams.push(questions);
  }

  Database_Kpi.query(deleteQuery, queryParams, (err, result) => {
    if (err) {
      console.error("Error deleting data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while deleting data." });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Data not found for the provided parameters." });
    }

    return res.json({
      success: true,
      message: "admin employee metric deleted successfully",
    });
  });
};
const Admin_Manager_Insert_Data = (req, res) => {
  try {
    const data = req.body;
    if (Array.isArray(data) && data.length > 0) {
      for (const entry of data) {
        const adminID = entry.adminID;
        const entryData = entry.data;

        if (Array.isArray(entryData) && entryData.length > 0) {
          for (const categoryData of entryData) {
            for (const entry in data) {
              const adminID = data[entry].adminID;

              for (const categoryData of data[entry].data) {
                for (const categoryName in categoryData) {
                  const subcategories = categoryData[categoryName];

                  for (const subcategory of subcategories) {
                    const subcategoryName = subcategory.Name;

                    if (subcategory.Questions && subcategory.QuantityTarget) {
                      for (let i = 0; i < subcategory.Questions.length; i++) {
                        const question = subcategory.Questions[i];
                        const quantityTarget = subcategory.QuantityTarget[i];
                        const checkQuery = `SELECT * FROM admin_data_manager_table WHERE adminID = ? AND Category = ? AND Name = ? AND Questions = ?`;
                        Database_Kpi.query(
                          checkQuery,
                          [adminID, categoryName, subcategoryName, question],
                          (err, results) => {
                            if (err) {
                              console.error(err);
                            } else {
                              if (results.length > 0) {
                                const updateQuery = `UPDATE admin_data_manager_table SET QuantityTarget = ? WHERE adminID = ? AND Category = ? AND Name = ? AND Questions = ?`;
                                Database_Kpi.query(
                                  updateQuery,
                                  [
                                    quantityTarget,
                                    adminID,
                                    categoryName,
                                    subcategoryName,
                                    question,
                                  ],
                                  (err, results) => {
                                    if (err) {
                                      console.error(err);
                                    }
                                  }
                                );
                              } else {
                                const insertQuery = `INSERT INTO admin_data_manager_table (adminID, Category, Name, Questions, QuantityTarget) VALUES (?, ?, ?, ?, ?)`;
                                Database_Kpi.query(
                                  insertQuery,
                                  [
                                    adminID,
                                    categoryName,
                                    subcategoryName,
                                    question,
                                    quantityTarget,
                                  ],
                                  (err, results) => {
                                    if (err) {
                                      console.error(err);
                                    }
                                  }
                                );
                              }
                            }
                          }
                        );
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return res
      .status(201)
      .json({ message: "admin manager metric insert successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
};
const Admin_Manager_Retrive_Data = (req, res) => {
  try {
    const responseData = {};

    const query = "SELECT * FROM admin_data_manager_table";
    Database_Kpi.query(query, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "An error occurred" });
      }

      results.forEach((row) => {
        const { Category, Name, Questions, QuantityTarget } = row;

        if (!responseData[Category]) {
          responseData[Category] = [];
        }

        const existingCategory = responseData[Category].find(
          (item) => item.Name === Name
        );

        if (!existingCategory) {
          responseData[Category].push({
            Name,
            Questions: Questions ? Questions.split("\n") : [],
            QuantityTarget: QuantityTarget
              ? QuantityTarget.split(",").map(Number)
              : [],
          });
        } else {
          existingCategory.Questions = [
            ...existingCategory.Questions,
            ...(Questions ? Questions.split("\n") : []),
          ];
          existingCategory.QuantityTarget = [
            ...existingCategory.QuantityTarget,
            ...(QuantityTarget ? QuantityTarget.split(",").map(Number) : []),
          ];
        }
      });

      return res.status(200).json(responseData);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
};
const Admin_Manager_Data_Delete = (req, res) => {
  const { adminID, category, name, questions } = req.params;

  if (!adminID) {
    return res.status(400).json({ error: "Invalid adminID provided" });
  }

  let deleteQuery = `
        DELETE FROM admin_data_manager_table 
        WHERE adminID = ?`;
  const queryParams = [adminID];

  if (category) {
    deleteQuery += " AND Category = ?";
    queryParams.push(category);
  }

  if (name) {
    deleteQuery += " AND Name = ?";
    queryParams.push(name);
  }

  if (questions) {
    deleteQuery += " AND questions = ?";
    queryParams.push(questions);
  }

  Database_Kpi.query(deleteQuery, queryParams, (err, result) => {
    if (err) {
      console.error("Error deleting data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while deleting data." });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Data not found for the provided parameters." });
    }

    return res.json({
      success: true,
      message: "admin manager metric deleted successfully",
    });
  });
};
const Admin_Director_Insert_Data = (req, res) => {
  try {
    const data = req.body;
    if (Array.isArray(data) && data.length > 0) {
      for (const entry of data) {
        const adminID = entry.adminID;
        const entryData = entry.data;

        if (Array.isArray(entryData) && entryData.length > 0) {
          for (const categoryData of entryData) {
            for (const entry in data) {
              const adminID = data[entry].adminID;

              for (const categoryData of data[entry].data) {
                for (const categoryName in categoryData) {
                  const subcategories = categoryData[categoryName];

                  for (const subcategory of subcategories) {
                    const subcategoryName = subcategory.Name;

                    if (subcategory.Questions && subcategory.QuantityTarget) {
                      for (let i = 0; i < subcategory.Questions.length; i++) {
                        const question = subcategory.Questions[i];
                        const quantityTarget = subcategory.QuantityTarget[i];
                        const checkQuery = `SELECT * FROM admin_data_director_table WHERE adminID = ? AND Category = ? AND Name = ? AND Questions = ?`;
                        Database_Kpi.query(
                          checkQuery,
                          [adminID, categoryName, subcategoryName, question],
                          (err, results) => {
                            if (err) {
                              console.error(err);
                            } else {
                              if (results.length > 0) {
                                const updateQuery = `UPDATE admin_data_director_table SET QuantityTarget = ? WHERE adminID = ? AND Category = ? AND Name = ? AND Questions = ?`;
                                Database_Kpi.query(
                                  updateQuery,
                                  [
                                    quantityTarget,
                                    adminID,
                                    categoryName,
                                    subcategoryName,
                                    question,
                                  ],
                                  (err, results) => {
                                    if (err) {
                                      console.error(err);
                                    }
                                  }
                                );
                              } else {
                                const insertQuery = `INSERT INTO admin_data_director_table (adminID, Category, Name, Questions, QuantityTarget) VALUES (?, ?, ?, ?, ?)`;
                                Database_Kpi.query(
                                  insertQuery,
                                  [
                                    adminID,
                                    categoryName,
                                    subcategoryName,
                                    question,
                                    quantityTarget,
                                  ],
                                  (err, results) => {
                                    if (err) {
                                      console.error(err);
                                    }
                                  }
                                );
                              }
                            }
                          }
                        );
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return res
      .status(201)
      .json({ message: "admin director metric insert successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
};
const Admin_Director_Retrive_Data =(req,res)=>
{
  try {
    const responseData = {};

    const query = "SELECT * FROM admin_data_director_table";
    Database_Kpi.query(query, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "An error occurred" });
      }

      results.forEach((row) => {
        const { Category, Name, Questions, QuantityTarget } = row;

        if (!responseData[Category]) {
          responseData[Category] = [];
        }

        const existingCategory = responseData[Category].find(
          (item) => item.Name === Name
        );

        if (!existingCategory) {
          responseData[Category].push({
            Name,
            Questions: Questions ? Questions.split("\n") : [],
            QuantityTarget: QuantityTarget
              ? QuantityTarget.split(",").map(Number)
              : [],
          });
        } else {
          existingCategory.Questions = [
            ...existingCategory.Questions,
            ...(Questions ? Questions.split("\n") : []),
          ];
          existingCategory.QuantityTarget = [
            ...existingCategory.QuantityTarget,
            ...(QuantityTarget ? QuantityTarget.split(",").map(Number) : []),
          ];
        }
      });

      return res.status(200).json(responseData);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  } 
}
const Admin_Director_Data_Delete =(req,res)=>
{
  const { adminID, category, name, questions } = req.params;

  if (!adminID) {
    return res.status(400).json({ error: "Invalid adminID provided" });
  }

  let deleteQuery = `
      DELETE FROM admin_data_director_table 
      WHERE adminID = ?`;
  const queryParams = [adminID];

  if (category) {
    deleteQuery += " AND Category = ?";
    queryParams.push(category);
  }

  if (name) {
    deleteQuery += " AND Name = ?";
    queryParams.push(name);
  }

  if (questions) {
    deleteQuery += " AND questions = ?";
    queryParams.push(questions);
  }

  Database_Kpi.query(deleteQuery, queryParams, (err, result) => {
    if (err) {
      console.error("Error deleting data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while deleting data." });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Data not found for the provided parameters." });
    }

    return res.json({ success: true, message: "admin director metric deleted successfully" });
  });
}
module.exports = {
  AdminPost,
  AdminloginPost,
  Admin_Employee_Insert_Data,
  Admin_Employee_Retrive_Data,
  Admin_Employee_Delete_Data,
  Admin_Manager_Insert_Data,
  Admin_Manager_Retrive_Data,
  Admin_Manager_Data_Delete,
  Admin_Director_Insert_Data,
  Admin_Director_Retrive_Data,
  Admin_Director_Data_Delete
};
