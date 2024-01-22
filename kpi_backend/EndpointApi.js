const express = require("express");
const Server_Logic = require("./ServerLogic");
const Database_Kpi = require("./kpiDatabase");
const app = express();
var parser = require("body-parser");
app.use(express.json({ limit: "10mb" }));
app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());
const cors = require("cors");
app.use(cors());
// const ip="172.17.15.150"
const port="4000";
//Send-verify-Email

app.post('/api/send_otp', (req, res) => {
  const { Empmail } = req.body;
  Server_Logic.generateAndSendOTP(Empmail, Database_Kpi, (result) => {
    res.status(result.status).json(result);
  });
}); 
app.post('/api/verify_otp', (req, res) => {
  const { Empmail, OTP, Password } = req.body;
  Server_Logic.verifyOTP(Empmail, OTP, Password, (error, message) => {
    if (error) {
      return res.status(401).json({ message: error });
    }
    return res.status(200).json({ message });
  });
});
//Admin-Data

app.post("/admin/register", (req, res, next) => {
  Server_Logic.AdminPost(req, res, () => {});
});
app.post("/admin/login", (req, res, next) => {
  Server_Logic.AdminloginPost(req, res, () => {});
});
app.post("/admin/emp_insrt", (req, res, next) => {
  Server_Logic.Admin_Employee_Insert_Data(req, res, () => {});
});
app.get("/admin/emp_data", (req, res, next) => {
  Server_Logic.Admin_Employee_Retrive_Data(req, res, () => {});
});
app.delete(
  "/admin/emp_del/:adminID/:category?/:name?/:questions?",
  (req, res, next) => {
    Server_Logic.Admin_Employee_Delete_Data(req, res, () => {});
  }
);
app.post("/admin/manager_insrt", (req, res, next) => {
  Server_Logic.Admin_Manager_Insert_Data(req, res, () => {});
});
app.get("/admin/manager_data", (req, res, next) => {
  Server_Logic.Admin_Manager_Retrive_Data(req, res, () => {});
});
app.delete(
  "/admin/manager_del/:adminID/:category?/:name?/:questions?",
  (req, res, next) => {
    Server_Logic.Admin_Manager_Data_Delete(req, res, () => {});
  }
);
app.post("/admin/director_insrt", (req, res, next) => {
  Server_Logic.Admin_Director_Insert_Data(req, res, () => {});
});
app.get("/admin/director_data", (req, res, next) => {
  Server_Logic.Admin_Director_Retrive_Data(req, res, () => {});
});
app.delete(
  "/admin/director_del/:adminID/:category?/:name?/:questions?",
  (req, res, next) => {
    Server_Logic.Admin_Director_Data_Delete(req, res, () => {});
  }
);

//Save-Data
app.post("/save/emp_insrt", (req, res, next) => {
  Server_Logic.Save_Employee_Insert_Data(req, res, () => {});
});
app.get("/save/emp_data/:Empid?/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Save_Employee_Retrive_Data(req, res, () => {});
});
app.put("/save_emp_upd/:Empid", (req, res, next) => {
  Server_Logic.Save_Employee_Data_Update(req, res, () => {});
});
app.delete("/save/emp_del/:Empid", (req, res, next) => {
  Server_Logic.Save_Employee_Data_Delete(req, res, () => {});
});
app.post("/save/manager_insrt", (req, res, next) => {
  Server_Logic.Save_Manager_Insert_Data(req, res, () => {});
});
app.get("/save/manager_data/:Empid?/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Save_Manager_Retrive_Data(req, res, () => {});
});
app.put("/save/manager_upd/:Empid", (req, res, next) => {
  Server_Logic.Save_Manager_Data_Update(req, res, () => {});
});
app.delete("/save/manager_del/:Empid", (req, res, next) => {
  Server_Logic.Save_Manager_Data_Delete(req, res, () => {});
});
app.post("/save/director_insrt", (req, res, next) => {
  Server_Logic.Save_Director_Insert_Data(req, res, () => {});
});
app.get("/save/director_data/:Empid?/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Save_Director_Retrive_Data(req, res, () => {});
});
app.put("/save/director_upd/:Empid", (req, res, next) => {
  Server_Logic.Save_Director_Update_Data(req, res, () => {});
});
app.delete("/save/director_del/:Empid", (req, res, next) => {
  Server_Logic.Save_Director_Delete_Data(req, res, () => {});
});

//Employee-Registration
app.post("/api/emp_register", (req, res) => {
  Server_Logic.registrationPost(req, res);
});
app.post("/api/emp_login", (req, res, next) => {
  Server_Logic.loginPost(req, res, () => {});
});
app.get("/api/emp_data/:Empid?", (req, res, next) => {
  Server_Logic.registrationGet(req, res, () => {});
});
app.put("/api/emp_password_upd", (req, res, next) => {
  Server_Logic.PasswordUpdate(req, res, () => {});
});
app.post("/api/emp_image_upd/:Empid", (req, res) => {
  Server_Logic.ImageUpdate(req, res, () => {});
});

//Employee-Data
app.post("/api/emp_insrt", (req, res, next) => {
  Server_Logic.Employee_Insert_Data(req, res, () => {});
});
app.get("/api/emp_userdata/:Empid/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Employee_Retrive_Data(req, res, () => {});
});
app.put("/api/emp_upd/:Empid/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Employee_Data_Update(req, res, () => {});
});
app.get("/api/emp_all_data/:Empid?/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Employee_All_Data_Retrieve(req, res, () => {});
});
app.put("/api/emp_status_upd/:Empid", (req, res, next) => {
  Server_Logic.Employee_Status_Update(req, res, () => {});
});
app.get("/api/emp_all_status_data/:Empid?", (req, res, next) => {
  Server_Logic.Employee_All_Status_Retrieve(req, res, () => {});
});

//Employee-Manager-Data
app.post("/api/emp_manager_insrt", (req, res, next) => {
  Server_Logic.Employee_And_Manager_Insert_Data(req, res, () => { });
});
app.get("/api/emp_manager_data/:Empid?/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Employee_And_Manager_Retrive_Data(req, res, () => { });
});
app.put("/api/emp_manager_upd/:Empid/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Employee_And_Manager_Data_Update(req, res, () => { }); 
});

//Employee-Director-Data
app.post("/api/emp_director_insrt", (req, res, next) => {
  Server_Logic.Employee_And_Director_Insert_Data(req, res, () => { });
});
app.get("/api/emp_director_data/:Empid/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Employee_And_Director_Retrive_Data(req, res, () => { });
}); 
app.put("/api/emp_director_upd/:Empid/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Employee_And_Director_Data_Update(req, res, () => { });
});

//Manager-Data
app.post("/api/manager_insrt", (req, res, next) => {
  Server_Logic.Manager_Insert_Data(req, res, () => { });
});
app.get("/api/manager_data/:Empid/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Manager_Retrive_Data(req, res, () => { });
});
app.put("/api/manager_upd/:Empid/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Manager_Data_Update(req, res, () => { });
});
app.get("/api/manager_all_data/:Empid?/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Manager_All_Data_Retrieve(req, res, () => { });
});
app.put("/api/manager_status_upd/:Empid", (req, res, next) => { 
  Server_Logic.Manager_Status_Update(req, res, () => { });
});
app.get("/api/manager_all_status_data/:Empid?", (req, res, next) => {
  Server_Logic.Manager_All_Status_Retrieve(req, res, () => { });
});

//Manager-Director-Data
app.post("/api/manager_director_insrt", (req, res, next) => {
  Server_Logic.Manager_Director_Insert_Data(req, res, () => { });
});
app.get("/api/manager_director_data/:Empid?/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Manager_Director_Retrive_Data(req, res, () => { });
});
app.put("/api/manager_director_upd/:Empid/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Manager_Director_Data_Update(req, res, () => { }); 
});

//Director-Data
app.post("/api/director_insrt", (req, res, next) => {
  Server_Logic.Director_Insert_Data(req, res, () => { });
});
app.get("/api/director_all_data/:Empid?/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Director_All_Data_Retrive(req, res, () => { });
});
app.put("/api/director_upd/:Empid/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Director_Data_Update(req, res, () => { });
});
app.get("/api/director_data/:Empid/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Director_Retrive_Data(req, res, () => { });
});
app.put("/api/director_status_upd/:Empid", (req, res, next) => { 
  Server_Logic.Director_Status_Update(req, res, () => { });
});
app.get("/api/director_all_status_data/:Empid?", (req, res, next) => {
  Server_Logic.Directror_All_Status_Retrive(req, res, () => { });
});

//Director-Manager-Data
app.post("/api/director_manager_insrt", (req, res, next) => {
  Server_Logic.Director_Manager_Insert_Data(req, res, () => { });
});
app.get("/api/director_manager_data/:Empid?/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Director_Manager_Retrive_Data(req, res, () => { });
});
app.put("/api/director_manager_upd/:Empid/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Director_Manager_Data_Update(req, res, () => { }); 
});


app.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`);
});
