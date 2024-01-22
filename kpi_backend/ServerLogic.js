const Database_Kpi = require("./kpiDatabase");
const Adminvalidations = require("./Validations/AdminValidations");
const validations = require("./Validations/EmployeeValidation");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const secretKey = "chinna";
const randomstring = require("randomstring");

//Send-And- Verify-Otp using node-mailer
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "chinnaanaparthi1@gmail.com",
    pass: "fxejeeodpvlgxybq",
  },
});

let otpStore = {};

const generateAndSendOTP = (EmpmailBase64, Database_Kpi, callback) => {
  const Empmail = Buffer.from(EmpmailBase64, "base64").toString("utf-8");
  console.log("Decoded Empmail:", Empmail);

  Database_Kpi.query(
    "SELECT * FROM employeeregister_data WHERE Empmail = ?",
    [Empmail],
    (err, results) => {
      if (err) {
        console.error(err);
        return callback({ status: 500, message: "Internal server error" });
      }
      const otp = randomstring.generate({ length: 6, charset: "numeric" });
      otpStore[EmpmailBase64] = { otp, timestamp: Date.now() };
      console.log(
        "OTP generated and stored in otpStore:",
        otpStore[EmpmailBase64]
      );

      const mailOptions = {
        from: "your-email-username",
        to: Empmail,
        subject: "Your OTP",
        html: `
            <span>Your OTP for Employee KPI Application is: <strong>${otp}</strong>. Please do not share it with anyone.</span>`,
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error(error);
          return callback({ status: 500, message: "Failed to send OTP" });
        }
        console.log("OTP sent successfully to:", Empmail);
        return callback({ status: 200, message: "OTP sent successfully" });
      });
    }
  );
};

const verifyOTP = (EmpmailBase64, OTP, Password, callback) => {
  const Empmail = Buffer.from(EmpmailBase64, "base64").toString("utf-8");
  console.log("Decoded Empmail for verification:", Empmail);

  if (!otpStore[EmpmailBase64]) {
    console.log("Empmail not found in otpStore or OTP expired");
    return callback({ error: "Empmail not found or OTP expired" });
  }

  const { otp, timestamp } = otpStore[EmpmailBase64];
  const otpValidityDuration = 5 * 60 * 1000;

  if (OTP !== otp || Date.now() - timestamp > otpValidityDuration) {
    delete otpStore[EmpmailBase64];
    console.log("Invalid OTP or OTP expired");
    return callback({ error: "Invalid OTP or OTP expired" });
  }

  Database_Kpi.query(
    "UPDATE employeeregister_data SET Password = ? WHERE Empmail = ?",
    [Password, EmpmailBase64],
    (updateErr) => {
      if (updateErr) {
        console.error(updateErr);
        return callback({ error: "Failed to update password" });
      }
      console.log(`Password updated for ${EmpmailBase64}: ${Password}`);
      delete otpStore[EmpmailBase64];
      console.log("OTP removed from otpStore");
      return callback(null, "Password updated successfully");
    }
  );
};
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

                                            // Check if a similar entry already exists in the database
                                            const checkQuery = `SELECT * FROM admin_data_employee_table WHERE adminID = ? AND Category = ? AND Name = ? AND Questions = ?`;
                                            Database_Kpi.query(checkQuery, [adminID, categoryName, subcategoryName, question], (err, results) => {
                                                if (err) {
                                                    console.error(err);
                                                } else {
                                                    if (results.length > 0) {
                                                        // Entry already exists, update it
                                                        const updateQuery = `UPDATE admin_data_employee_table SET QuantityTarget = ? WHERE adminID = ? AND Category = ? AND Name = ? AND Questions = ?`;
                                                        Database_Kpi.query(updateQuery, [quantityTarget, adminID, categoryName, subcategoryName, question], (err, results) => {
                                                            if (err) {
                                                                console.error(err);
                                                            }
                                                        });
                                                    } else {
                                                        // Entry doesn't exist, insert a new one
                                                        const insertQuery = `INSERT INTO admin_data_employee_table (adminID, Category, Name, Questions, QuantityTarget) VALUES (?, ?, ?, ?, ?)`;
                                                        Database_Kpi.query(insertQuery, [adminID, categoryName, subcategoryName, question, quantityTarget], (err, results) => {
                                                            if (err) {
                                                                console.error(err);
                                                            }
                                                        });
                                                    }
                                                }
                                            });
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

    return res.status(201).json({ message: 'admin employee metric inserted successfully' });
} catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred' });
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

                                            // Check if a similar entry already exists in the database
                                            const checkQuery = `SELECT * FROM admin_data_manager_table WHERE adminID = ? AND Category = ? AND Name = ? AND Questions = ?`;
                                            Database_Kpi.query(checkQuery, [adminID, categoryName, subcategoryName, question], (err, results) => {
                                                if (err) {
                                                    console.error(err);
                                                } else {
                                                    if (results.length > 0) {
                                                        // Entry already exists, update it
                                                        const updateQuery = `UPDATE admin_data_manager_table SET QuantityTarget = ? WHERE adminID = ? AND Category = ? AND Name = ? AND Questions = ?`;
                                                        Database_Kpi.query(updateQuery, [quantityTarget, adminID, categoryName, subcategoryName, question], (err, results) => {
                                                            if (err) {
                                                                console.error(err);
                                                            }
                                                        });
                                                    } else {
                                                        // Entry doesn't exist, insert a new one
                                                        const insertQuery = `INSERT INTO admin_data_manager_table (adminID, Category, Name, Questions, QuantityTarget) VALUES (?, ?, ?, ?, ?)`;
                                                        Database_Kpi.query(insertQuery, [adminID, categoryName, subcategoryName, question, quantityTarget], (err, results) => {
                                                            if (err) {
                                                                console.error(err);
                                                            }
                                                        });
                                                    }
                                                }
                                            });
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

    return res.status(201).json({ message: 'admin manager metric inserted successfully' });
} catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred' });
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

                                            // Check if a similar entry already exists in the database
                                            const checkQuery = `SELECT * FROM admin_data_director_table WHERE adminID = ? AND Category = ? AND Name = ? AND Questions = ?`;
                                            Database_Kpi.query(checkQuery, [adminID, categoryName, subcategoryName, question], (err, results) => {
                                                if (err) {
                                                    console.error(err);
                                                } else {
                                                    if (results.length > 0) {
                                                        // Entry already exists, update it
                                                        const updateQuery = `UPDATE admin_data_director_table SET QuantityTarget = ? WHERE adminID = ? AND Category = ? AND Name = ? AND Questions = ?`;
                                                        Database_Kpi.query(updateQuery, [quantityTarget, adminID, categoryName, subcategoryName, question], (err, results) => {
                                                            if (err) {
                                                                console.error(err);
                                                            }
                                                        });
                                                    } else {
                                                        // Entry doesn't exist, insert a new one
                                                        const insertQuery = `INSERT INTO admin_data_director_table (adminID, Category, Name, Questions, QuantityTarget) VALUES (?, ?, ?, ?, ?)`;
                                                        Database_Kpi.query(insertQuery, [adminID, categoryName, subcategoryName, question, quantityTarget], (err, results) => {
                                                            if (err) {
                                                                console.error(err);
                                                            }
                                                        });
                                                    }
                                                }
                                            });
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

    return res.status(201).json({ message: 'admin director metric inserted successfully' });
} catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred' });
}
};
const Admin_Director_Retrive_Data = (req, res) => {
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
};
const Admin_Director_Data_Delete = (req, res) => {
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

    return res.json({
      success: true,
      message: "admin director metric deleted successfully",
    });
  });
};

//Save-Data
const Save_Employee_Insert_Data = (req, res) => {
  const data = req.body;
  if (
    !data ||
    !data[0] ||
    !data[0].Empid ||
    !data[0].Empname ||
    !data[0].data ||
    !Array.isArray(data[0].data)
  ) {
    return res.status(400).json({ error: "Invalid request body" });
  }
  const values = [];

  for (const entry of data[0].data) {
    const { Value, valuecreater } = entry;
    for (const category of valuecreater) {
      const { name, questions } = category;
      for (const question of questions) {
        const { Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments } =
          question;

        values.push([
          data[0].Empid,
          data[0].Empname,
          Value,
          name,
          Metric,
          QuantityTarget,
          QuantityAchieved,
          IndexKpi,
          Comments,
        ]);
      }
    }
  }
  const insertQuery = `INSERT INTO save_all_datastored_employee_table (Empid, Empname, Value, Name, Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments) VALUES ?`;
  Database_Kpi.query(insertQuery, [values], (err, result) => {
    if (err) {
      console.error("Error storing data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while storing data." });
    }
    return res.json({
      success: true,
      message: "Save_Employee_Data stored successfully",
    });
  });
};
const Save_Employee_Retrive_Data = (req, res) => {
  const { Empid, Value, Name } = req.params;
  let query = `
      SELECT * FROM save_all_datastored_employee_table`;

  if (Empid) {
    query += ` WHERE save_all_datastored_employee_table.Empid = ?`;

    if (Value) {
      query += ` AND save_all_datastored_employee_table.Value = ?`;

      if (Name) {
        query += ` AND save_all_datastored_employee_table.Name = ?;`;
      } else {
        query += `;`;
      }
    } else {
      query += `;`;
    }

    const queryParams = [Empid];

    if (Value) {
      queryParams.push(Value);
    }

    if (Name) {
      queryParams.push(Name);
    }

    Database_Kpi.query(query, queryParams, (err, result) => {
      if (err) {
        console.error("Error fetching data:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while fetching data" });
      }

      if (result.length === 0) {
        return res
          .status(404)
          .json({ error: `Employee with Empid ${Empid} not found` });
      }

      const employeeData = {
        Empid: result[0].Empid,
        Empname: result[0].Empname,
        ratings: result.map((row) => ({
          Value: row.Value,
          Name: row.Name,
          Metric: row.Metric,
          QuantityTarget: row.QuantityTarget,
          QuantityAchieved: row.QuantityAchieved,
          IndexKpi: row.IndexKpi,
          Comments: row.Comments,
        })),
      };

      res.status(200).json({ employee: employeeData });
    });
  } else {
    Database_Kpi.query(query, (err, result) => {
      if (err) {
        console.error("Error fetching data:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while fetching data" });
      }

      const employeesData = {};
      result.forEach((row) => {
        if (!employeesData[row.Empid]) {
          employeesData[row.Empid] = {
            Empid: row.Empid,
            Empname: row.Empname,
            ratings: [],
          };
        }
        employeesData[row.Empid].ratings.push({
          Value: row.Value,
          Name: row.Name,
          Metric: row.Metric,
          QuantityTarget: row.QuantityTarget,
          QuantityAchieved: row.QuantityAchieved,
          IndexKpi: row.IndexKpi,
          Comments: row.Comments,
        });
      });

      const employees = Object.values(employeesData);
      res.status(200).json({ employees });
    });
  }
};
const Save_Employee_Data_Update = (req, res) => {
  const { Data } = req.body;
  const { Empid } = req.params;
  if (!Data || !Array.isArray(Data)) {
    return res.status(400).json({ error: "Invalid request data" });
  }
  const updateQuery = `
          UPDATE save_all_datastored_employee_table
          SET QuantityTarget = ?,
              QuantityAchieved = ?,
              IndexKpi = ?,
              Comments = ?
          WHERE 
              Empid = ? AND
              Value = ? AND
              Name = ? AND
              Metric = ?`;

  const promises = [];
  Data.forEach((item) => {
    const {
      Value,
      Name,
      Metric,
      QuantityTarget,
      QuantityAchieved,
      IndexKpi,
      Comments,
    } = item;
    promises.push(
      new Promise((resolve, reject) => {
        Database_Kpi.query(
          updateQuery,
          [
            QuantityTarget,
            QuantityAchieved,
            IndexKpi,
            Comments,
            Empid,
            Value,
            Name,
            Metric,
          ],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      })
    );
  });
  Promise.all(promises)
    .then(() => {
      return res.json({
        success: true,
        message: "save_Employee_Data updated successfully",
      });
    })
    .catch((err) => {
      console.error("Error updating data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while updating data." });
    });
};
const Save_Employee_Data_Delete = (req, res) => {
  const { Empid } = req.params;

  if (!Empid) {
    return res.status(400).json({ error: "Invalid Empid provided" });
  }

  const deleteQuery = `
        DELETE FROM save_all_datastored_employee_table WHERE Empid = ?;
      `;

  Database_Kpi.query(deleteQuery, [Empid], (err, result) => {
    if (err) {
      console.error("Error deleting employee data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while deleting employee data." });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Employee data not found for the provided Empid." });
    }

    return res.json({
      success: true,
      message: "Saved Employee data deleted successfully",
    });
  });
};
const Save_Manager_Insert_Data = (req, res) => {
  const data = req.body;
  if (
    !data ||
    !data[0] ||
    !data[0].Empid ||
    !data[0].Empname ||
    !data[0].data ||
    !Array.isArray(data[0].data)
  ) {
    return res.status(400).json({ error: "Invalid request body" });
  }
  const values = [];

  for (const entry of data[0].data) {
    const { Value, valuecreater } = entry;
    for (const category of valuecreater) {
      const { name, questions } = category;
      for (const question of questions) {
        const { Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments } =
          question;

        values.push([
          data[0].Empid,
          data[0].Empname,
          Value,
          name,
          Metric,
          QuantityTarget,
          QuantityAchieved,
          IndexKpi,
          Comments,
        ]);
      }
    }
  }
  const insertQuery = `INSERT INTO save_all_datastored_manager_table (Empid, Empname, Value, Name, Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments) VALUES ?`;
  Database_Kpi.query(insertQuery, [values], (err, result) => {
    if (err) {
      console.error("Error storing data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while storing data." });
    }
    return res.json({
      success: true,
      message: "Save_manager_Data stored successfully",
    });
  });
};
const Save_Manager_Retrive_Data = (req, res) => {
  const { Empid, Value, Name } = req.params;
  let query = `
      SELECT * FROM save_all_datastored_manager_table`;

  if (Empid) {
    query += ` WHERE save_all_datastored_manager_table.Empid = ?`;

    if (Value) {
      query += ` AND save_all_datastored_manager_table.Value = ?`;

      if (Name) {
        query += ` AND save_all_datastored_manager_table.Name = ?;`;
      } else {
        query += `;`;
      }
    } else {
      query += `;`;
    }

    const queryParams = [Empid];

    if (Value) {
      queryParams.push(Value);
    }

    if (Name) {
      queryParams.push(Name);
    }

    Database_Kpi.query(query, queryParams, (err, result) => {
      if (err) {
        console.error("Error fetching data:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while fetching data" });
      }

      if (result.length === 0) {
        return res
          .status(404)
          .json({ error: `Employee with Empid ${Empid} not found` });
      }

      const employeeData = {
        Empid: result[0].Empid,
        Empname: result[0].Empname,
        ratings: result.map((row) => ({
          Value: row.Value,
          Name: row.Name,
          Metric: row.Metric,
          QuantityTarget: row.QuantityTarget,
          QuantityAchieved: row.QuantityAchieved,
          IndexKpi: row.IndexKpi,
          Comments: row.Comments,
        })),
      };

      res.status(200).json({ employee: employeeData });
    });
  } else {
    Database_Kpi.query(query, (err, result) => {
      if (err) {
        console.error("Error fetching data:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while fetching data" });
      }

      const employeesData = {};
      result.forEach((row) => {
        if (!employeesData[row.Empid]) {
          employeesData[row.Empid] = {
            Empid: row.Empid,
            Empname: row.Empname,
            ratings: [],
          };
        }
        employeesData[row.Empid].ratings.push({
          Value: row.Value,
          Name: row.Name,
          Metric: row.Metric,
          QuantityTarget: row.QuantityTarget,
          QuantityAchieved: row.QuantityAchieved,
          IndexKpi: row.IndexKpi,
          Comments: row.Comments,
        });
      });

      const employees = Object.values(employeesData);
      res.status(200).json({ employees });
    });
  }
};
const Save_Manager_Data_Update = (req, res) => {
  const { Data } = req.body;
  const { Empid } = req.params;

  if (!Data || !Array.isArray(Data)) {
    return res.status(400).json({ error: "Invalid request data" });
  }
  const updateQuery = `
          UPDATE save_all_datastored_manager_table
          SET QuantityTarget = ?,
              QuantityAchieved = ?,
              IndexKpi = ?,
              Comments = ?
          WHERE 
              Empid = ? AND
              Value = ? AND
              Name = ? AND
              Metric = ?`;

  const promises = [];
  Data.forEach((item) => {
    const {
      Value,
      Name,
      Metric,
      QuantityTarget,
      QuantityAchieved,
      IndexKpi,
      Comments,
    } = item;
    promises.push(
      new Promise((resolve, reject) => {
        Database_Kpi.query(
          updateQuery,
          [
            QuantityTarget,
            QuantityAchieved,
            IndexKpi,
            Comments,
            Empid,
            Value,
            Name,
            Metric,
          ],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      })
    );
  });
  Promise.all(promises)
    .then(() => {
      return res.json({
        success: true,
        message: "Save_Manager_Data updated successfully",
      });
    })
    .catch((err) => {
      console.error("Error updating data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while updating data." });
    });
};
const Save_Manager_Data_Delete = (req, res) => {
  const { Empid } = req.params;

  if (!Empid) {
    return res.status(400).json({ error: "Invalid Empid provided" });
  }

  const deleteQuery = `
        DELETE FROM save_all_datastored_manager_table WHERE Empid = ?;
      `;

  Database_Kpi.query(deleteQuery, [Empid], (err, result) => {
    if (err) {
      console.error("Error deleting employee data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while deleting employee data." });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Employee data not found for the provided Empid." });
    }

    return res.json({
      success: true,
      message: "Saved_Manager data deleted successfully",
    });
  });
};
const Save_Director_Insert_Data =(req,res)=>
{
  const data = req.body;
  if (
    !data ||
    !data[0] ||
    !data[0].Empid ||
    !data[0].Empname ||
    !data[0].data ||
    !Array.isArray(data[0].data)
  ) {
    return res.status(400).json({ error: "Invalid request body" });
  }
  const values = [];

  for (const entry of data[0].data) {
    const { Value, valuecreater } = entry;
    for (const category of valuecreater) {
      const { name, questions } = category;
      for (const question of questions) {
        const { Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments } =
          question;

        values.push([
          data[0].Empid,
          data[0].Empname,
          Value,
          name,
          Metric,
          QuantityTarget,
          QuantityAchieved,
          IndexKpi,
          Comments,
        ]);
      }
    }
  }
  const insertQuery = `INSERT INTO save_all_datastored_director_table (Empid, Empname, Value, Name, Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments) VALUES ?`;
  Database_Kpi.query(insertQuery, [values], (err, result) => {
    if (err) {
      console.error("Error storing data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while storing data." });
    }
    return res.json({
      success: true,
      message: "Save_director_Data stored successfully",
    });
  });
}
const Save_Director_Retrive_Data =(req,res)=>
{
  const { Empid, Value, Name } = req.params;
  let query = `
    SELECT * FROM save_all_datastored_director_table`;

  // Check if Empid is provided in the URL
  if (Empid) {
    query += ` WHERE save_all_datastored_manager_table.Empid = ?`;

    // If Values is provided, filter by Values
    if (Value) {
      query += ` AND save_all_datastored_manager_table.Value = ?`;

      // If Name is provided, filter by Name
      if (Name) {
        query += ` AND save_all_datastored_manager_table.Name = ?;`;
      } else {
        query += `;`;
      }
    } else {
      query += `;`;
    }

    const queryParams = [Empid];

    if (Value) {
      queryParams.push(Value);
    }

    if (Name) {
      queryParams.push(Name);
    }

    Database_Kpi.query(query, queryParams, (err, result) => {
      if (err) {
        console.error("Error fetching data:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while fetching data" });
      }

      if (result.length === 0) {
        return res
          .status(404)
          .json({ error: `Employee with Empid ${Empid} not found` });
      }

      const employeeData = {
        Empid: result[0].Empid,
        Empname: result[0].Empname,
        ratings: result.map((row) => ({
          Value: row.Value,
          Name: row.Name,
          Metric: row.Metric,
          QuantityTarget: row.QuantityTarget,
          QuantityAchieved: row.QuantityAchieved,
          IndexKpi: row.IndexKpi,
          Comments: row.Comments,
        })),
      };

      res.status(200).json({ employee: employeeData });
    });
  } else {
    Database_Kpi.query(query, (err, result) => {
      if (err) {
        console.error("Error fetching data:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while fetching data" });
      }

      const employeesData = {};
      result.forEach((row) => {
        if (!employeesData[row.Empid]) {
          employeesData[row.Empid] = {
            Empid: row.Empid,
            Empname: row.Empname,
            ratings: [],
          };
        }
        employeesData[row.Empid].ratings.push({
          Value: row.Value,
          Name: row.Name,
          Metric: row.Metric,
          QuantityTarget: row.QuantityTarget,
          QuantityAchieved: row.QuantityAchieved,
          IndexKpi: row.IndexKpi,
          Comments: row.Comments,
        });
      });

      const employees = Object.values(employeesData);
      res.status(200).json({ employees });
    });
  } 
}
const Save_Director_Update_Data =(req,res)=>
{
  const { Data } = req.body;
  const { Empid } = req.params; // Extract Empid from URL parameters.

  // Check if 'Data' is missing or not an array.
  if (!Data || !Array.isArray(Data)) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  // SQL update query template.
  const updateQuery = `
        UPDATE save_all_datastored_director_table
        SET QuantityTarget = ?,
            QuantityAchieved = ?,
            IndexKpi = ?,
            Comments = ?
        WHERE 
            Empid = ? AND
            Value = ? AND
            Name = ? AND
            Metric = ?`;

  const promises = [];

  // Iterate over the 'Data' array and create promises for each data item to update the database.
  Data.forEach((item) => {
    const {
      Value,
      Name,
      Metric,
      QuantityTarget,
      QuantityAchieved,
      IndexKpi,
      Comments,
    } = item;
    promises.push(
      new Promise((resolve, reject) => {
        // Execute the SQL update query using the 'Database_Kpi' object.
        Database_Kpi.query(
          updateQuery,
          [
            QuantityTarget,
            QuantityAchieved,
            IndexKpi,
            Comments,
            Empid,
            Value,
            Name,
            Metric,
          ],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      })
    );
  });

  // Wait for all update promises to complete.
  Promise.all(promises)
    .then(() => {
      return res.json({
        success: true,
        message: "Save_Director_Data updated successfully",
      });
    })
    .catch((err) => {
      console.error("Error updating data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while updating data." });
    }); 
}
const Save_Director_Delete_Data =(req,res)=>
{
  const { Empid } = req.params;

  if (!Empid) {
    return res.status(400).json({ error: "Invalid Empid provided" });
  }

  const deleteQuery = `
      DELETE FROM save_all_datastored_director_table WHERE Empid = ?;
    `;

  Database_Kpi.query(deleteQuery, [Empid], (err, result) => {
    if (err) {
      console.error("Error deleting employee data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while deleting employee data." });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Employee data not found for the provided Empid." });
    }

    return res.json({
      success: true,
      message: "Saved_Manager data deleted successfully",
    });
  });
}

//mail-function
function sendDeclineEmail(Email, subject, text, callback) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "chinnaanaparthi1@gmail.com",
      pass: "fxejeeodpvlgxybq",
    },
  });

  const mailOptions = {
    from: "chinnaanaparthi1@gmail.com",
    to: Email,
    subject: subject,
    text: text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      // console.error(error);
      callback(error, null);
    } else {
      callback(null, info);
    }
  });
}

//Employee-Registration
const registrationPost = (req, res) => {
  const validation = validations.validate(req.body);

  if (validation.error) {
    return res.status(400).json({ error: validation.error.details[0].message });
  }
  const {
    Empid,
    Empmail,
    Firstname,
    Lastname,
    Role,
    Practies,
    Reportingmanager,
    Password,
    Reportinghr,
    Location,
    Image
  } = req.body;
  const checkQuery =
    "SELECT * FROM employeeregister_data WHERE Empid = ? OR Empmail = ?";
  const checkValues = [Empid, Empmail];

  Database_Kpi.query(checkQuery, checkValues, (checkErr, checkResults) => {
    if (checkErr) {
      console.error(checkErr);
      return res
        .status(200)
        .json({
          error: "An error occurred while checking for existing records.",
        });
    }

    if (checkResults.length > 0) {
      return res
        .status(200)
        .json({
          error: "User with the same Empid or Empmail already registered.",
        });
    }
    const query = `
            INSERT INTO employeeregister_data (
                Empid,
                Empmail,
                Firstname,
                Lastname,
                Role,
                Practies,
                Reportingmanager,
                Reportinghr,
                Password,
                Location,
                Image
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      Empid,
      Empmail,
      Firstname,
      Lastname,
      Role,
      Practies,
      Reportingmanager,
      Reportinghr,
      Password, 
      Location,
      Image,
    ];

    Database_Kpi.query(query, values, (err, resp) => {
      if (err) {
        console.error(err);
        return res
          .status(200)
          .json({ error: "An error occurred while registering the employee." });
      }
      return res.status(200).json({ message: "Employee successfully registered." });
    });
  });
};
const loginPost = (req, res) => {
  const query =
    "SELECT * FROM employeeregister_data WHERE Empmail = '" +
    req.body.Empmail +
    "' AND Password = '" +
    req.body.Password +
    "'";
  Database_Kpi.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ error: "An error occurred while logging in" });
    } else {
      if (results.length > 0) {
        const user = results[0];
        const payload = {
          id:user.id,
          Empid: user.Empid,
          Empmail: user.Empmail,
          Firstname: user.Firstname,
          Lastname: user.Lastname,
          Role: user.Role,
          Practies: user.Practies,
          Reportingmanager: user.Reportingmanager,
          Reportinghr: user.Reportinghr,
          Password: user.Password,
          Location: user.Location,
          Image: user.Image,
        };
        jwt.sign(payload, secretKey, { expiresIn: "1hr" }, (err, token) => {
          if (err) {
            res
              .status(500)
              .json({ error: "An error occurred while generating token" });
          } else {
            res.status(200).json({ message: "Login successful", token });
          }
        });
      } else {
        res.status(401).json({ message: "User not found" });
      }
    }
  });
};
const registrationGet = (req, res) => {
  const { Empid } = req.params;

  if (Empid) {
    const query = "SELECT * FROM employeeregister_data WHERE Empid = ?";
    const values = [Empid];

    Database_Kpi.query(query, values, (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ error: "An error occurred while fetching KPI data." });
      }
      if (result.length === 0) {
        return res
          .status(404)
          .json({
            error: "Employee KPI data for the provided Empid not found.",
          });
      }
      return res.status(200).json({ message: result });
    });
  } else {
    const query = "SELECT * FROM employeeregister_data";
    Database_Kpi.query(query, (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ error: "An error occurred while fetching KPI data." });
      }
      return res.status(200).json({ message: result });
    });
  }
};
const PasswordUpdate = (req, res) => {
  const { Empmail, Password } = req.body;
  if (!Empmail || !Password) {
    return res
      .status(400)
      .json({ error: "Empmail and Password are required." });
  }
  const updateQuery =
    "UPDATE employeeregister_data SET Password = ? WHERE Empmail = ?";
  const updateValues = [Password, Empmail];

  Database_Kpi.query(updateQuery, updateValues, (updateErr, updateResults) => {
    if (updateErr) {
      console.error(updateErr);
      return res
        .status(500)
        .json({ error: "An error occurred while updating the password." });
    }

    if (updateResults.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Employee with the provided Empmail not found." });
    }
    return res.json({ message: "Password updated successfully." });
  });
};
const ImageUpdate = (req, res) => {
  const { Empid } = req.params;
  const {Image}=req.body;
  if (!Empid) {
    return res
      .status(400)
      .json({ error: "FirstName and LastName are required." });
  }
  const updateQuery =
    "UPDATE employeeregister_data SET Image = ? WHERE Empid = ? ";
  const updateValues = [Image, Empid];

  Database_Kpi.query(updateQuery, updateValues, (updateErr, updateResults) => {
    if (updateErr) {
      console.error(updateErr);
      return res
        .status(500)
        .json({ error: "An error occurred while updating the image." });
    }

    if (updateResults.affectedRows === 0) {
      return res
        .status(404)
        .json({
          error: "Employee with the provided FirstName and LastName not found.",
        });
    }

    return res.json({ message: "Image updated successfully." });
  });
};
//Employee-Data
const Employee_Insert_Data = (req, res) => {
  const data = req.body;
  if (
    !data ||
    !data[0] ||
    !data[0].Empid ||
    !data[0].Empname ||
    !data[0].data ||
    !Array.isArray(data[0].data)
  ) {
    return res.status(400).json({ error: "Invalid request body" });
  }
  const values = [];

  for (const entry of data[0].data) {
    const { Value, valuecreater } = entry;
    for (const category of valuecreater) {
      const { name, questions } = category;
      for (const question of questions) {
        const { Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments } =
          question;

        values.push([
          data[0].Empid,
          data[0].Empname,
          Value,
          name,
          Metric,
          QuantityTarget,
          QuantityAchieved,
          IndexKpi,
          Comments,
        ]);
      }
    }
  }
  const insertQuery = `INSERT INTO all_datastored_employeedata_table (Empid, Empname, Value, Name, Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments) VALUES ?`;
  Database_Kpi.query(insertQuery, [values], (err, result) => {
    if (err) {
      console.error("Error storing data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while storing data." });
    }
    return res.json({
      success: true,
      message: "Employee_Data stored successfully",
    });
  });
};
const Employee_Retrive_Data = (req, res) => {
  const { Empid, Value, Name } = req.params;

  let selectQuery = `
        SELECT Empid, Empname, Value, Name, Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments
        FROM all_datastored_employeedata_table
        WHERE 1`;

  const queryParams = [];

  if (Empid) {
    selectQuery += " AND Empid = ?";
    queryParams.push(Empid);
  }

  if (Value) {
    selectQuery += " AND Value = ?";
    queryParams.push(Value);
  }

  if (Name) {
    selectQuery += " AND Name = ?";
    queryParams.push(Name);
  }

  Database_Kpi.query(selectQuery, queryParams, (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching data." });
    }

    const formattedData = [];
    let currentEmpid = null;
    let currentValue = null;
    let currentName = null;

    result.forEach((item) => {
      if (
        currentEmpid !== item.Empid ||
        currentValue !== item.Value ||
        currentName !== item.Name
      ) {
        currentEmpid = item.Empid;
        currentValue = item.Value;
        currentName = item.Name;

        formattedData.push({
          Empid: item.Empid,
          Empname: item.Empname,
          Value: item.Value,
          Name: item.Name,
          Data: [],
        });
      }

      const lastIndex = formattedData.length - 1;
      formattedData[lastIndex].Data.push({
        Metric: item.Metric,
        QuantityTarget: item.QuantityTarget,
        QuantityAchieved: item.QuantityAchieved,
        IndexKpi: item.IndexKpi,
        Comments: item.Comments,
      });
    });

    return res.json({ success: true, data: formattedData });
  });
};
const Employee_Data_Update = (req, res) => {
  const { Data } = req.body;
  const { Value, Name, Empid } = req.params;

  if (!Value || !Name || !Empid || !Data || !Array.isArray(Data)) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  const updateQuery = `
        UPDATE all_datastored_employeedata_table
        SET QuantityAchieved = ?,
            IndexKpi = ?,
            Comments = ?
        WHERE Empid = ? AND Value = ? AND Name = ? AND Metric = ?`;

  const promises = [];

  Data.forEach((item) => {
    const { Metric, QuantityAchieved, IndexKpi, Comments } = item;
    promises.push(
      new Promise((resolve, reject) => {
        Database_Kpi.query(
          updateQuery,
          [QuantityAchieved, IndexKpi, Comments, Empid, Value, Name, Metric],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      })
    );
  });

  Promise.all(promises)
    .then(() => {
      return res.json({
        success: true,
        message: "Employee_Data updated successfully",
      });
    })
    .catch((err) => {
      console.error("Error updating data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while updating data." });
    });
};
const Employee_All_Data_Retrieve = (req, res) => {
  const { Empid, Value, Name } = req.params;
  let query = `
    SELECT * FROM all_datastored_employeedata_table`;

  const queryParams = [];

  // Check if Empid is provided in the URL
  if (Empid) {
    query += ` WHERE Empid = ?`;
    queryParams.push(Empid);

    // If Value is provided, filter by Value
    if (Value) {
      query += ` AND Value = ?`;
      queryParams.push(Value);

      // If Name is provided, filter by Name
      if (Name) {
        query += ` AND Name = ?`;
        queryParams.push(Name);
      }
    }
  }

  Database_Kpi.query(query, queryParams, (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching data" });
    }

    if (result.length === 0) {
      if (Empid) {
        return res
          .status(404)
          .json({ error: `Employee with Empid ${Empid} not found` });
      } else {
        return res.status(404).json({ error: "No employees found" });
      }
    }

    if (Empid) {
      const employeeData = {
        Empid: result[0].Empid,
        Empname: result[0].Empname,
        ratings: result.map((row) => ({
          Value: row.Value,
          Name: row.Name,
          Metric: row.Metric,
          QuantityTarget: row.QuantityTarget,
          QuantityAchieved: row.QuantityAchieved,
          IndexKpi: row.IndexKpi,
          Comments: row.Comments,
        })),
      };
      res.status(200).json({ employee: employeeData });
    } else {
      const employeesData = {};
      result.forEach((row) => {
        if (!employeesData[row.Empid]) {
          employeesData[row.Empid] = {
            Empid: row.Empid,
            Empname: row.Empname,
            ratings: [],
          };
        }
        employeesData[row.Empid].ratings.push({
          Value: row.Value,
          Name: row.Name,
          Metric: row.Metric,
          QuantityTarget: row.QuantityTarget,
          QuantityAchieved: row.QuantityAchieved,
          IndexKpi: row.IndexKpi,
          Comments: row.Comments,
        });
      });

      const employees = Object.values(employeesData);
      res.status(200).json({ status: true, employees });
    }
  });
};
const  Employee_Status_Update = (req, res) => {
  try {
    const { Status, Email } = req.body;
    const { Empid } = req.params;

    const updateQuery =
      "UPDATE all_datastored_employeedata_table SET Status = ? WHERE Empid = ?";

    Database_Kpi.query(updateQuery, [Status, Empid], (error, results) => {
      if (error) {
        res
          .status(500)
          .json({ error: "Error updating status in MySQL database" });
      } else if (results.affectedRows === 0) {
        res
          .status(404)
          .json({
            error:
              "Record with the provided employeeId not found in the database.",
          });
      } else {
        if (Status === "Decline") {
          sendDeclineEmail(
            Email,
            "Review of Submitted Form",
            "We have reviewed your submitted form, and unfortunately, we must decline it at this time. Please review our feedback and make the necessary adjustments. Thank you..",
            (emailError, emailInfo) => {
              if (emailError) {
                res
                  .status(500)
                  .json({ error: "Error sending email notification." });
              } else {
                res
                  .status(200)
                  .json({
                    message: "Status updated successfully, and email sent.",
                  });
              }
            }
          );
        } else {
          res.status(200).json({ message: "Status updated successfully." });
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Error updating status in MySQL database" });
  }
};
const Employee_All_Status_Retrieve = (req, res) => {
  const { Empid } = req.params;

  let query = `
      SELECT Empid, Status
      FROM all_datastored_employeedata_table`;

  const queryParams = [];

  // Check if Empid is provided in the URL
  if (Empid) {
    query += ` WHERE Empid = ?`;
    queryParams.push(Empid);
  }

  Database_Kpi.query(query, queryParams, (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching data" });
    }

    if (result.length === 0) {
      if (Empid) {
        return res
          .status(404)
          .json({ error: `Employee with Empid ${Empid} not found` });
      } else {
        return res.status(404).json({ error: "No employees found" });
      }
    }

    if (Empid) {
      const employeeData = {
        Empid: result[0].Empid,
        Status: result[0].Status,
      };
      res.status(200).json({ employee: employeeData });
    } else {
      const employeesData = {};
      result.forEach((row) => {
        employeesData[row.Empid] = {
          Empid: row.Empid,
          Status: row.Status,
        };
      });

      const employees = Object.values(employeesData);
      res.status(200).json({ status: true, employees });
    }
  });
};

//Employee-Manager-Data
const Employee_And_Manager_Insert_Data = (req, res) => {
  const data = req.body;
  if (
    !data ||
    !data[0] ||
    !data[0].Empid ||
    !data[0].Empname ||
    !data[0].data ||
    !Array.isArray(data[0].data)
  ) {
    return res.status(400).json({ error: "Invalid request body" });
  }
  const values = [];

  for (const entry of data[0].data) {
    const { Value, valuecreater } = entry;
    for (const category of valuecreater) {
      const { name, questions } = category;
      for (const question of questions) {
        const {
          Metric,
          QuantityTarget,
          QuantityAchieved,
          IndexKpi,
          Comments,
          ManagerRating,
          ManagerComments,
        } = question;

        values.push([
          data[0].Empid,
          data[0].Empname,
          Value,
          name,
          Metric,
          QuantityTarget,
          QuantityAchieved,
          IndexKpi,
          Comments,
          ManagerRating,
          ManagerComments,
        ]);
      }
    }
  }
  const insertQuery = `INSERT INTO all_datastored_employeemanager_table (Empid, Empname, Value, Name, Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments,ManagerRating,ManagerComments) VALUES ?`;
  Database_Kpi.query(insertQuery, [values], (err, result) => {
    if (err) {
      console.error("Error storing data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while storing data." });
    }
    return res.json({
      success: true,
      message: "Employee_Manager_Data stored successfully",
    });
  });
};
const Employee_And_Manager_Retrive_Data = (req, res) => {
  const { Empid, Value, Name } = req.params;
  // const {Name}=req.params.Name || '';
  let selectQuery = `
        SELECT Empid, Empname, Value, Name, Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments,ManagerRating,ManagerComments
        FROM all_datastored_employeemanager_table
        WHERE 1`;

  const queryParams = [];

  if (Empid) {
    selectQuery += " AND Empid = ?";
    queryParams.push(Empid);
  }

  if (Value) {
    selectQuery += " AND Value = ?";
    queryParams.push(Value);
  }

  if (Name) {
    selectQuery += " AND Name = ?";
    queryParams.push(Name);
  }
  Database_Kpi.query(selectQuery, queryParams, (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching data." });
    }

    const formattedData = [];
    let currentEmpid = null;
    let currentValue = null;
    let currentName = null;

    result.forEach((item) => {
      if (
        currentEmpid !== item.Empid ||
        currentValue !== item.Value ||
        currentName !== item.Name
      ) {
        currentEmpid = item.Empid;
        currentValue = item.Value;
        currentName = item.Name;

        formattedData.push({
          Empid: item.Empid,
          Empname: item.Empname,
          Value: item.Value,
          Name: item.Name,
          Data: [],
        });
      }

      const lastIndex = formattedData.length - 1;
      formattedData[lastIndex].Data.push({
        Metric: item.Metric,
        QuantityTarget: item.QuantityTarget,
        QuantityAchieved: item.QuantityAchieved,
        IndexKpi: item.IndexKpi,
        Comments: item.Comments,
        ManagerRating: item.ManagerRating,
        ManagerComments: item.ManagerComments,
      });
    });

    return res.json({ success: true, data: formattedData });
  });
};
const Employee_And_Manager_Data_Update = (req, res) => {
  const { Data } = req.body;
  const { Value, Name, Empid } = req.params;

  if (!Value || !Name || !Empid || !Data || !Array.isArray(Data)) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  const updateQuery = `
        UPDATE all_datastored_employeemanager_table
        SET ManagerRating = ?,
        ManagerComments =?
        WHERE Empid = ? AND Value = ? AND Name = ? AND Metric = ?`;

  const promises = [];

  Data.forEach((item) => {
    const { Metric, ManagerRating, ManagerComments } = item;
    promises.push(
      new Promise((resolve, reject) => {
        Database_Kpi.query(
          updateQuery,
          [ManagerRating, ManagerComments, Empid, Value, Name, Metric],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      })
    );
  });

  Promise.all(promises)
    .then(() => {
      return res.json({
        success: true,
        message: "Employee_Manager_Data updated successfully",
      });
    })
    .catch((err) => {
      console.error("Error updating data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while updating data." });
    });
};

//Employee-Director-Data
const Employee_And_Director_Insert_Data = (req, res) => {
  const data = req.body;
  if (
    !data ||
    !data[0] ||
    !data[0].Empid ||
    !data[0].Empname ||
    !data[0].data ||
    !Array.isArray(data[0].data)
  ) {
    return res.status(400).json({ error: "Invalid request body" });
  }
  const values = [];

  for (const entry of data[0].data) {
    const { Value, valuecreater } = entry;
    for (const category of valuecreater) {
      const { name, questions } = category;
      for (const question of questions) {
        const {
          Metric,
          QuantityTarget,
          QuantityAchieved,
          IndexKpi,
          Comments,
          ManagerRating,
          ManagerComments,
          DirectorRating,
          DirectorComments,
        } = question;

        values.push([
          data[0].Empid,
          data[0].Empname,
          Value,
          name,
          Metric,
          QuantityTarget,
          QuantityAchieved,
          IndexKpi,
          Comments,
          ManagerRating,
          ManagerComments,
          DirectorRating,
          DirectorComments,
        ]);
      }
    }
  }
  const insertQuery = `INSERT INTO all_datastored_employeedirector_table (Empid, Empname, Value, Name, Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments,ManagerRating,ManagerComments,DirectorRating,DirectorComments) VALUES ?`;
  Database_Kpi.query(insertQuery, [values], (err, result) => {
    if (err) {
      console.error("Error storing data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while storing data." });
    }
    return res.json({
      success: true,
      message: "Employee_Director_Data stored successfully",
    });
  });
};
const Employee_And_Director_Retrive_Data = (req, res) => {
  const { Empid, Value, Name } = req.params;

  let selectQuery = `
        SELECT Empid, Empname, Value, Name, Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments,ManagerRating,ManagerComments,DirectorRating,DirectorComments
        FROM all_datastored_employeedirector_table
        WHERE 1`;

  const queryParams = [];

  if (Empid) {
    selectQuery += " AND Empid = ?";
    queryParams.push(Empid);
  }

  if (Value) {
    selectQuery += " AND Value = ?";
    queryParams.push(Value);
  }

  if (Name) {
    selectQuery += " AND Name = ?";
    queryParams.push(Name);
  }

  Database_Kpi.query(selectQuery, queryParams, (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching data." });
    }

    const formattedData = [];
    let currentEmpid = null;
    let currentValue = null;
    let currentName = null;

    result.forEach((item) => {
      if (
        currentEmpid !== item.Empid ||
        currentValue !== item.Value ||
        currentName !== item.Name
      ) {
        currentEmpid = item.Empid;
        currentValue = item.Value;
        currentName = item.Name;

        formattedData.push({
          Empid: item.Empid,
          Empname: item.Empname,
          Value: item.Value,
          Name: item.Name,
          Data: [],
        });
      }

      const lastIndex = formattedData.length - 1;
      formattedData[lastIndex].Data.push({
        Metric: item.Metric,
        QuantityTarget: item.QuantityTarget,
        QuantityAchieved: item.QuantityAchieved,
        IndexKpi: item.IndexKpi,
        Comments: item.Comments,
        ManagerRating: item.ManagerRating,
        ManagerComments: item.ManagerComments,
        DirectorRating: item.DirectorRating,
        DirectorComments: item.DirectorComments,
      });
    });

    return res.json({ success: true, data: formattedData });
  });
};
const Employee_And_Director_Data_Update = (req, res) => {
  const { Data } = req.body;
  const { Value, Name, Empid } = req.params;

  if (!Value || !Name || !Empid || !Data || !Array.isArray(Data)) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  const updateQuery = `
        UPDATE all_datastored_employeedirector_table
        SET DirectorRating = ?,
        DirectorComments =?
        WHERE Empid = ? AND Value = ? AND Name = ? AND Metric = ?`;

  const promises = [];

  Data.forEach((item) => {
    const { Metric, DirectorRating, DirectorComments } = item;
    promises.push(
      new Promise((resolve, reject) => {
        Database_Kpi.query(
          updateQuery,
          [DirectorRating, DirectorComments, Empid, Value, Name, Metric],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      })
    );
  });

  Promise.all(promises)
    .then(() => {
      return res.json({
        success: true,
        message: "Employee_Director_Data updated successfully",
      });
    })
    .catch((err) => {
      console.error("Error updating data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while updating data." });
    });
};

//Manager-Data
const Manager_Insert_Data = (req, res) => {
  const data = req.body;
  if (
    !data ||
    !data[0] ||
    !data[0].Empid ||
    !data[0].Empname ||
    !data[0].data ||
    !Array.isArray(data[0].data)
  ) {
    return res.status(400).json({ error: "Invalid request body" });
  }
  const values = [];

  for (const entry of data[0].data) {
    const { Value, valuecreater } = entry;

    if (!Array.isArray(valuecreater)) {
      // Handle the case where valuecreater is not an array
      console.error("Invalid data structure: valuecreater is not an array");
      return res.status(400).json({ error: "Invalid data structure" });
    }

    for (const category of valuecreater) {
      const { name, questions } = category;

      if (!Array.isArray(questions)) {
        // Handle the case where questions is not an array
        console.error("Invalid data structure: questions is not an array");
        return res.status(400).json({ error: "Invalid data structure" });
      }

      for (const question of questions) {
        const { Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments } =
          question;

        values.push([
          data[0].Empid,
          data[0].Empname,
          Value,
          name,
          Metric,
          QuantityTarget,
          QuantityAchieved,
          IndexKpi,
          Comments,
        ]);
      }
    }
  }

  const insertQuery = `INSERT INTO all_datastored_managerdata_table (Empid, Empname, Value, Name, Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments) VALUES ?`;

  Database_Kpi.query(insertQuery, [values], (err, result) => {
    if (err) {
      console.error("Error storing data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while storing data." });
    }
    return res.json({
      success: true,
      message: "Manager_Data stored successfully",
    });
  });
};
const Manager_Retrive_Data = (req, res) => {
  const { Empid, Value, Name } = req.params;

  let selectQuery = `
        SELECT Empid, Empname, Value, Name, Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments
        FROM all_datastored_managerdata_table
        WHERE 1`;

  const queryParams = [];

  if (Empid) {
    selectQuery += " AND Empid = ?";
    queryParams.push(Empid);
  }

  if (Value) {
    selectQuery += " AND Value = ?";
    queryParams.push(Value);
  }

  if (Name) {
    selectQuery += " AND Name = ?";
    queryParams.push(Name);
  }

  Database_Kpi.query(selectQuery, queryParams, (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching data." });
    }

    const formattedData = [];
    let currentEmpid = null;
    let currentValue = null;
    let currentName = null;

    result.forEach((item) => {
      if (
        currentEmpid !== item.Empid ||
        currentValue !== item.Value ||
        currentName !== item.Name
      ) {
        currentEmpid = item.Empid;
        currentValue = item.Value;
        currentName = item.Name;

        formattedData.push({
          Empid: item.Empid,
          Empname: item.Empname,
          Value: item.Value,
          Name: item.Name,
          Data: [],
        });
      }

      const lastIndex = formattedData.length - 1;
      formattedData[lastIndex].Data.push({
        Metric: item.Metric,
        QuantityTarget: item.QuantityTarget,
        QuantityAchieved: item.QuantityAchieved,
        IndexKpi: item.IndexKpi,
        Comments: item.Comments,
      });
    });

    return res.json({ success: true, data: formattedData });
  });
};
const Manager_Data_Update = (req, res) => {
  const { Data } = req.body;
  const { Value, Name, Empid } = req.params;

  if (!Value || !Name || !Empid || !Data || !Array.isArray(Data)) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  const updateQuery = `
        UPDATE all_datastored_managerdata_table
        SET QuantityAchieved = ?,
            IndexKpi = ?,
            Comments = ?
        WHERE Empid = ? AND Value = ? AND Name = ? AND Metric = ?`;

  const promises = [];

  Data.forEach((item) => {
    const { Metric, QuantityAchieved, IndexKpi, Comments } = item;
    promises.push(
      new Promise((resolve, reject) => {
        Database_Kpi.query(
          updateQuery,
          [QuantityAchieved, IndexKpi, Comments, Empid, Value, Name, Metric],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      })
    );
  });

  Promise.all(promises)
    .then(() => {
      return res.json({
        success: true,
        message: "Manager_Data updated successfully",
      });
    })
    .catch((err) => {
      console.error("Error updating data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while updating data." });
    });
};
const Manager_All_Data_Retrieve = (req, res) => {
  const { Empid, Value, Name } = req.params;
  let query = `
    SELECT Empid, Empname, Value, Name, Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments
    FROM all_datastored_managerdata_table`;

  const queryParams = [];

  // Check if Empid is provided in the URL
  if (Empid) {
    query += ` WHERE Empid = ?`;
    queryParams.push(Empid);

    // If Value is provided, filter by Value
    if (Value) {
      query += ` AND Value = ?`;
      queryParams.push(Value);

      // If Name is provided, filter by Name
      if (Name) {
        query += ` AND Name = ?`;
        queryParams.push(Name);
      }
    }
  }

  Database_Kpi.query(query, queryParams, (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching data" });
    }

    if (result.length === 0) {
      if (Empid) {
        return res
          .status(404)
          .json({ error: `Employee with Empid ${Empid} not found` });
      } else {
        return res.status(404).json({ error: "No employees found" });
      }
    }

    if (Empid) {
      const employeeData = {
        Empid: result[0].Empid,
        Empname: result[0].Empname,
        ratings: result.map((row) => ({
          Value: row.Value,
          Name: row.Name,
          Metric: row.Metric,
          QuantityTarget: row.QuantityTarget,
          QuantityAchieved: row.QuantityAchieved,
          IndexKpi: row.IndexKpi,
          Comments: row.Comments,
        })),
      };
      res.status(200).json({ employee: employeeData });
    } else {
      const employeesData = {};
      result.forEach((row) => {
        if (!employeesData[row.Empid]) {
          employeesData[row.Empid] = {
            Empid: row.Empid,
            Empname: row.Empname,
            ratings: [],
          };
        }
        employeesData[row.Empid].ratings.push({
          Value: row.Value,
          Name: row.Name,
          Metric: row.Metric,
          QuantityTarget: row.QuantityTarget,
          QuantityAchieved: row.QuantityAchieved,
          IndexKpi: row.IndexKpi,
          Comments: row.Comments,
        });
      });

      const employees = Object.values(employeesData);
      res.status(200).json({ status: true, employees });
    }
  });
};
const Manager_Status_Update = (req, res) => {
  try {
    const { Status, Email } = req.body;
    const { Empid } = req.params;

    const updateQuery =
      "UPDATE all_datastored_managerdata_table SET Status = ? WHERE Empid = ?";

    Database_Kpi.query(updateQuery, [Status, Empid], (error, results) => {
      if (error) {
        res
          .status(500)
          .json({ error: "Error updating status in MySQL database" });
      } else if (results.affectedRows === 0) {
        res
          .status(404)
          .json({
            error:
              "Record with the provided employeeId not found in the database.",
          });
      } else {
        if (Status === "Decline") {
          sendDeclineEmail(
            Email,
            "Review of Submitted Form",
            "We have reviewed your submitted form, and unfortunately, we must decline it at this time. Please review our feedback and make the necessary adjustments. Thank you..",
            (emailError, emailInfo) => {
              if (emailError) {
                res
                  .status(500)
                  .json({ error: "Error sending email notification." });
              } else {
                res
                  .status(200)
                  .json({
                    message: "Status updated successfully, and email sent.",
                  });
              }
            }
          );
        } else {
          res.status(200).json({ message: "Status updated successfully." });
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Error updating status in MySQL database" });
  }
};
const Manager_All_Status_Retrieve = (req, res) => {
  const { Empid } = req.params;

  let query = `
      SELECT Empid, Status
      FROM all_datastored_managerdata_table`;

  const queryParams = [];

  // Check if Empid is provided in the URL
  if (Empid) {
    query += ` WHERE Empid = ?`;
    queryParams.push(Empid);
  }

  Database_Kpi.query(query, queryParams, (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching data" });
    }

    if (result.length === 0) {
      if (Empid) {
        return res
          .status(404)
          .json({ error: `Employee with Empid ${Empid} not found` });
      } else {
        return res.status(404).json({ error: "No employees found" });
      }
    }

    if (Empid) {
      const employeeData = {
        Empid: result[0].Empid,
        Status: result[0].Status,
      };
      res.status(200).json({ employee: employeeData });
    } else {
      const employeesData = {};
      result.forEach((row) => {
        employeesData[row.Empid] = {
          Empid: row.Empid,
          Status: row.Status,
        };
      });

      const employees = Object.values(employeesData);
      res.status(200).json({ status: true, employees });
    }
  });
};

//Manager-Director-Data
const Manager_Director_Insert_Data = (req, res) => {
  const data = req.body;
  if (
    !data ||
    !data[0] ||
    !data[0].Empid ||
    !data[0].Empname ||
    !data[0].data ||
    !Array.isArray(data[0].data)
  ) {
    return res.status(400).json({ error: "Invalid request body" });
  }
  const values = [];

  for (const entry of data[0].data) {
    const { Value, valuecreater } = entry;
    for (const category of valuecreater) {
      const { name, questions } = category;
      for (const question of questions) {
        const {
          Metric,
          QuantityTarget,
          QuantityAchieved,
          IndexKpi,
          Comments,
          DirectorRating,
          DirectorComments,
        } = question;

        values.push([
          data[0].Empid,
          data[0].Empname,
          Value,
          name,
          Metric,
          QuantityTarget,
          QuantityAchieved,
          IndexKpi,
          Comments,
          DirectorRating,
          DirectorComments,
        ]);
      }
    }
  }
  const insertQuery = `INSERT INTO all_datastored_directordata_table (Empid, Empname, Value, Name, Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments,DirectorRating,DirectorComments) VALUES ?`;
  Database_Kpi.query(insertQuery, [values], (err, result) => {
    if (err) {
      console.error("Error storing data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while storing data." });
    }
    return res.json({
      success: true,
      message: "Manager_Director_Data stored successfully",
    });
  });
};
const Manager_Director_Retrive_Data = (req, res) => {
  const { Empid, Value, Name } = req.params;

  let selectQuery = `
        SELECT Empid, Empname, Value, Name, Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments,DirectorRating,DirectorComments
        FROM all_datastored_directordata_table
        WHERE 1`;

  const queryParams = [];

  if (Empid) {
    selectQuery += " AND Empid = ?";
    queryParams.push(Empid);
  }

  if (Value) {
    selectQuery += " AND Value = ?";
    queryParams.push(Value);
  }

  if (Name) {
    selectQuery += " AND Name = ?";
    queryParams.push(Name);
  }

  Database_Kpi.query(selectQuery, queryParams, (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching data." });
    }

    const formattedData = [];
    let currentEmpid = null;
    let currentValue = null;
    let currentName = null;

    result.forEach((item) => {
      if (
        currentEmpid !== item.Empid ||
        currentValue !== item.Value ||
        currentName !== item.Name
      ) {
        currentEmpid = item.Empid;
        currentValue = item.Value;
        currentName = item.Name;

        formattedData.push({
          Empid: item.Empid,
          Empname: item.Empname,
          Value: item.Value,
          Name: item.Name,
          Data: [],
        });
      }

      const lastIndex = formattedData.length - 1;
      formattedData[lastIndex].Data.push({
        Metric: item.Metric,
        QuantityTarget: item.QuantityTarget,
        QuantityAchieved: item.QuantityAchieved,
        IndexKpi: item.IndexKpi,
        Comments: item.Comments,
        DirectorRating: item.DirectorRating,
        DirectorComments: item.DirectorComments,
      });
    });

    return res.json({ success: true, data: formattedData });
  });
};
const Manager_Director_Data_Update = (req, res) => {
  const { Data } = req.body;
  const { Value, Name, Empid } = req.params;

  if (!Value || !Name || !Empid || !Data || !Array.isArray(Data)) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  const updateQuery = `
        UPDATE all_datastored_directordata_table
        SET DirectorRating = ?,
        DirectorComments =?
        WHERE Empid = ? AND Value = ? AND Name = ? AND Metric = ?`;

  const promises = [];

  Data.forEach((item) => {
    const { Metric, DirectorRating, DirectorComments } = item;
    promises.push(
      new Promise((resolve, reject) => {
        Database_Kpi.query(
          updateQuery,
          [DirectorRating, DirectorComments, Empid, Value, Name, Metric],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      })
    );
  });

  Promise.all(promises)
    .then(() => {
      return res.json({
        success: true,
        message: "Employee_Director_Data updated successfully",
      });
    })
    .catch((err) => {
      console.error("Error updating data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while updating data." });
    });
};

//Director-Data
const Director_Insert_Data = (req, res) => {
  const data = req.body;
  if (
    !data ||
    !data[0] ||
    !data[0].Empid ||
    !data[0].Empname ||
    !data[0].data ||
    !Array.isArray(data[0].data)
  ) {
    return res.status(400).json({ error: "Invalid request body" });
  }
  const values = [];

  for (const entry of data[0].data) {
    const { Value, valuecreater } = entry;

    if (!Array.isArray(valuecreater)) {
      // Handle the case where valuecreater is not an array
      console.error("Invalid data structure: valuecreater is not an array");
      return res.status(400).json({ error: "Invalid data structure" });
    }

    for (const category of valuecreater) {
      const { name, questions } = category;

      if (!Array.isArray(questions)) {
        // Handle the case where questions is not an array
        console.error("Invalid data structure: questions is not an array");
        return res.status(400).json({ error: "Invalid data structure" });
      }

      for (const question of questions) {
        const { Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments } =
          question;

        values.push([
          data[0].Empid,
          data[0].Empname,
          Value,
          name,
          Metric,
          QuantityTarget,
          QuantityAchieved,
          IndexKpi,
          Comments,
        ]);
      }
    }
  }

  const insertQuery = `INSERT INTO all_datastored_directorform_table (Empid, Empname, Value, Name, Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments) VALUES ?`;

  Database_Kpi.query(insertQuery, [values], (err, result) => {
    if (err) {
      console.error("Error storing data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while storing data." });
    }
    return res.json({
      success: true,
      message: "Director_Data stored successfully",
    });
  });
};
const Director_All_Data_Retrive = (req, res) => {
  const { Empid, Value, Name } = req.params;
  let query = `
    SELECT Empid, Empname, Value, Name, Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments
    FROM all_datastored_directorform_table`;

  const queryParams = [];

  // Check if Empid is provided in the URL
  if (Empid) {
    query += ` WHERE Empid = ?`;
    queryParams.push(Empid);

    // If Value is provided, filter by Value
    if (Value) {
      query += ` AND Value = ?`;
      queryParams.push(Value);

      // If Name is provided, filter by Name
      if (Name) {
        query += ` AND Name = ?`;
        queryParams.push(Name);
      }
    }
  }

  Database_Kpi.query(query, queryParams, (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching data" });
    }

    if (result.length === 0) {
      if (Empid) {
        return res
          .status(404)
          .json({ error: `Employee with Empid ${Empid} not found` });
      } else {
        return res.status(404).json({ error: "No employees found" });
      }
    }

    if (Empid) {
      const employeeData = {
        Empid: result[0].Empid,
        Empname: result[0].Empname,
        ratings: result.map((row) => ({
          Value: row.Value,
          Name: row.Name,
          Metric: row.Metric,
          QuantityTarget: row.QuantityTarget,
          QuantityAchieved: row.QuantityAchieved,
          IndexKpi: row.IndexKpi,
          Comments: row.Comments,
        })),
      };
      res.status(200).json({ employee: employeeData });
    } else {
      const employeesData = {};
      result.forEach((row) => {
        if (!employeesData[row.Empid]) {
          employeesData[row.Empid] = {
            Empid: row.Empid,
            Empname: row.Empname,
            ratings: [],
          };
        }
        employeesData[row.Empid].ratings.push({
          Value: row.Value,
          Name: row.Name,
          Metric: row.Metric,
          QuantityTarget: row.QuantityTarget,
          QuantityAchieved: row.QuantityAchieved,
          IndexKpi: row.IndexKpi,
          Comments: row.Comments,
        });
      });

      const employees = Object.values(employeesData);
      res.status(200).json({ status: true, employees });
    }
  });
};
const Director_Data_Update = (req, res) => {
  const { Data } = req.body;
  const { Value, Name, Empid } = req.params;

  if (!Value || !Name || !Empid || !Data || !Array.isArray(Data)) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  const updateQuery = `
        UPDATE all_datastored_directorform_table
        SET QuantityAchieved = ?,
            IndexKpi = ?,
            Comments = ?
        WHERE Empid = ? AND Value = ? AND Name = ? AND Metric = ?`;

  const promises = [];

  Data.forEach((item) => {
    const { Metric, QuantityAchieved, IndexKpi, Comments } = item;
    promises.push(
      new Promise((resolve, reject) => {
        Database_Kpi.query(
          updateQuery,
          [QuantityAchieved, IndexKpi, Comments, Empid, Value, Name, Metric],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      })
    );
  });

  Promise.all(promises)
    .then(() => {
      return res.json({
        success: true,
        message: "Director_Data updated successfully",
      });
    })
    .catch((err) => {
      console.error("Error updating data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while updating data." });
    });
};
const Director_Status_Update = (req, res) => {
  try {
    const { Status, Email } = req.body;
    const { Empid } = req.params;

    const updateQuery =
      "UPDATE all_datastored_directorform_table SET Status = ? WHERE Empid = ?";

    Database_Kpi.query(updateQuery, [Status, Empid], (error, results) => {
      if (error) {
        res
          .status(500)
          .json({ error: "Error updating status in MySQL database" });
      } else if (results.affectedRows === 0) {
        res
          .status(404)
          .json({
            error:
              "Record with the provided employeeId not found in the database.",
          });
      } else {
        if (Status === "Decline") {
          sendDeclineEmail(
            Email,
            "Review of Submitted Form",
            "We have reviewed your submitted form, and unfortunately, we must decline it at this time. Please review our feedback and make the necessary adjustments. Thank you..",
            (emailError, emailInfo) => {
              if (emailError) {
                res
                  .status(500)
                  .json({ error: "Error sending email notification." });
              } else {
                res
                  .status(200)
                  .json({
                    message: "Status updated successfully, and email sent.",
                  });
              }
            }
          );
        } else {
          res.status(200).json({ message: "Status updated successfully." });
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Error updating status in MySQL database" });
  }
};
const Director_Retrive_Data = (req, res) => {
  const { Empid, Value, Name } = req.params;

  let selectQuery = `
        SELECT Empid, Empname, Value, Name, Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments
        FROM all_datastored_directorform_table
        WHERE 1`;

  const queryParams = [];

  if (Empid) {
    selectQuery += " AND Empid = ?";
    queryParams.push(Empid);
  }

  if (Value) {
    selectQuery += " AND Value = ?";
    queryParams.push(Value);
  }

  if (Name) {
    selectQuery += " AND Name = ?";
    queryParams.push(Name);
  }

  Database_Kpi.query(selectQuery, queryParams, (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching data." });
    }

    const formattedData = [];
    let currentEmpid = null;
    let currentValue = null;
    let currentName = null;

    result.forEach((item) => {
      if (
        currentEmpid !== item.Empid ||
        currentValue !== item.Value ||
        currentName !== item.Name
      ) {
        currentEmpid = item.Empid;
        currentValue = item.Value;
        currentName = item.Name;

        formattedData.push({
          Empid: item.Empid,
          Empname: item.Empname,
          Value: item.Value,
          Name: item.Name,
          Data: [],
        });
      }

      const lastIndex = formattedData.length - 1;
      formattedData[lastIndex].Data.push({
        Metric: item.Metric,
        QuantityTarget: item.QuantityTarget,
        QuantityAchieved: item.QuantityAchieved,
        IndexKpi: item.IndexKpi,
        Comments: item.Comments,
      });
    });

    return res.json({ success: true, data: formattedData });
  });
};
const Directror_All_Status_Retrive = (req, res) => {
  const { Empid } = req.params;

  let query = `
      SELECT Empid, Status
      FROM all_datastored_directorform_table`;

  const queryParams = [];

  // Check if Empid is provided in the URL
  if (Empid) {
    query += ` WHERE Empid = ?`;
    queryParams.push(Empid);
  }

  Database_Kpi.query(query, queryParams, (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching data" });
    }

    if (result.length === 0) {
      if (Empid) {
        return res
          .status(404)
          .json({ error: `Employee with Empid ${Empid} not found` });
      } else {
        return res.status(404).json({ error: "No employees found" });
      }
    }

    if (Empid) {
      const employeeData = {
        Empid: result[0].Empid,
        Status: result[0].Status,
      };
      res.status(200).json({ employee: employeeData });
    } else {
      const employeesData = {};
      result.forEach((row) => {
        employeesData[row.Empid] = {
          Empid: row.Empid,
          Status: row.Status,
        };
      });

      const employees = Object.values(employeesData);
      res.status(200).json({ status: true, employees });
    }
  });
};

//Director-Manager-Data
const Director_Manager_Insert_Data = (req, res) => {
  const data = req.body;
  if (
    !data ||
    !data[0] ||
    !data[0].Empid ||
    !data[0].Empname ||
    !data[0].data ||
    !Array.isArray(data[0].data)
  ) {
    return res.status(400).json({ error: "Invalid request body" });
  }
  const values = [];

  for (const entry of data[0].data) {
    const { Value, valuecreater } = entry;
    for (const category of valuecreater) {
      const { name, questions } = category;
      for (const question of questions) {
        const {
          Metric,
          QuantityTarget,
          QuantityAchieved,
          IndexKpi,
          Comments,
          VpRating,
          VpComments,
        } = question;

        values.push([
          data[0].Empid,
          data[0].Empname,
          Value,
          name,
          Metric,
          QuantityTarget,
          QuantityAchieved,
          IndexKpi,
          Comments,
          VpRating,
          VpComments,
        ]);
      }
    }
  }
  const insertQuery = `INSERT INTO all_datastored_vptable_table (Empid, Empname, Value, Name, Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments,VpRating,VpComments) VALUES ?`;
  Database_Kpi.query(insertQuery, [values], (err, result) => {
    if (err) {
      console.error("Error storing data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while storing data." });
    }
    return res.json({
      success: true,
      message: "Director_Manager_Data stored successfully",
    });
  });
};
const Director_Manager_Retrive_Data = (req, res) => {
  const { Empid, Value, Name } = req.params;

  let selectQuery = `
        SELECT Empid, Empname, Value, Name, Metric, QuantityTarget, QuantityAchieved, IndexKpi, Comments,VpRating,VpComments
        FROM all_datastored_vptable_table
        WHERE 1`;

  const queryParams = [];

  if (Empid) {
    selectQuery += " AND Empid = ?";
    queryParams.push(Empid);
  }

  if (Value) {
    selectQuery += " AND Value = ?";
    queryParams.push(Value);
  }

  if (Name) {
    selectQuery += " AND Name = ?";
    queryParams.push(Name);
  }

  Database_Kpi.query(selectQuery, queryParams, (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching data." });
    }

    const formattedData = [];
    let currentEmpid = null;
    let currentValue = null;
    let currentName = null;

    result.forEach((item) => {
      if (
        currentEmpid !== item.Empid ||
        currentValue !== item.Value ||
        currentName !== item.Name
      ) {
        currentEmpid = item.Empid;
        currentValue = item.Value;
        currentName = item.Name;

        formattedData.push({
          Empid: item.Empid,
          Empname: item.Empname,
          Value: item.Value,
          Name: item.Name,
          Data: [],
        });
      }

      const lastIndex = formattedData.length - 1;
      formattedData[lastIndex].Data.push({
        Metric: item.Metric,
        QuantityTarget: item.QuantityTarget,
        QuantityAchieved: item.QuantityAchieved,
        IndexKpi: item.IndexKpi,
        Comments: item.Comments,
        VpRating: item.VpRating,
        VpComments: item.VpComments,
      });
    });

    return res.json({ success: true, data: formattedData });
  });
};
const Director_Manager_Data_Update = (req, res) => {
  const { Data } = req.body;
  const { Value, Name, Empid } = req.params;

  if (!Value || !Name || !Empid || !Data || !Array.isArray(Data)) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  const updateQuery = `
        UPDATE all_datastored_vptable_table
        SET VpRating = ?,
        VpComments =?
        WHERE Empid = ? AND Value = ? AND Name = ? AND Metric = ?`;

  const promises = [];

  Data.forEach((item) => {
    const { Metric, VpRating, VpComments } = item;
    promises.push(
      new Promise((resolve, reject) => {
        Database_Kpi.query(
          updateQuery,
          [VpRating, VpComments, Empid, Value, Name, Metric],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      })
    );
  });

  Promise.all(promises)
    .then(() => {
      return res.json({
        success: true,
        message: "Director_Manager_Data updated successfully",
      });
    })
    .catch((err) => {
      console.error("Error updating data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while updating data." });
    });
};





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
  Admin_Director_Data_Delete,
  Save_Employee_Insert_Data,
  Save_Employee_Retrive_Data,
  Save_Employee_Data_Update,
  Save_Employee_Data_Delete,
  Save_Manager_Insert_Data,
  Save_Manager_Retrive_Data,
  Save_Manager_Data_Update,
  Save_Manager_Data_Delete,
  Save_Director_Insert_Data,
  Save_Director_Retrive_Data,
  Save_Director_Update_Data,
  Save_Director_Delete_Data,
  Employee_Insert_Data,
  Employee_Retrive_Data,
  Employee_Data_Update,
  Employee_All_Data_Retrieve,
  Employee_Status_Update,
  Employee_All_Status_Retrieve,
  registrationPost,
  loginPost,
  registrationGet,
  PasswordUpdate,
  ImageUpdate,
  generateAndSendOTP,
  verifyOTP,
  Manager_Insert_Data,
  Manager_Retrive_Data,
  Manager_Data_Update,
  Manager_All_Data_Retrieve,
  Manager_Status_Update,
  Manager_All_Status_Retrieve,
  Director_Insert_Data,
  Director_All_Data_Retrive,
  Director_Data_Update,
  Director_Status_Update,
  Director_Retrive_Data,
  Directror_All_Status_Retrive,
  Employee_And_Manager_Insert_Data,
  Employee_And_Manager_Retrive_Data,
  Employee_And_Manager_Data_Update,
  Employee_And_Director_Insert_Data,
  Employee_And_Director_Retrive_Data,
  Employee_And_Director_Data_Update,
  Manager_Director_Insert_Data,
  Manager_Director_Retrive_Data,
  Manager_Director_Data_Update,
  Director_Manager_Insert_Data,
  Director_Manager_Retrive_Data,
  Director_Manager_Data_Update
};
