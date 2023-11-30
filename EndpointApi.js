const express = require("express");
const Server_Logic = require("./ServerLogic");
const app = express();
var parser = require("body-parser");
app.use(parser.json());
const cors = require("cors");
app.use(cors());
const port = 2000;

//Admin-Data
app.post("/admin/RegisterKPI", (req, res, next) => {
  Server_Logic.AdminPost(req, res, () => {});
});
app.post("/admin/LoginKPI", (req, res, next) => {
  Server_Logic.AdminloginPost(req, res, () => {});
});
app.post("/admin/Employee", (req, res, next) => {
  Server_Logic.Admin_Employee_Insert_Data(req, res, () => {});
});
app.get("/admin/Employee", (req, res, next) => {
  Server_Logic.Admin_Employee_Retrive_Data(req, res, () => {});
});
app.delete(
  "/admin/Employee/:adminID/:category?/:name?/:questions?",
  (req, res, next) => {
    Server_Logic.Admin_Employee_Delete_Data(req, res, () => {});
  }
);

app.post("/admin/Manager", (req, res, next) => {
  Server_Logic.Admin_Manager_Insert_Data(req, res, () => {});
});
app.get("/admin/Manager", (req, res, next) => {
  Server_Logic.Admin_Manager_Retrive_Data(req, res, () => {});
});
app.delete(
  "/admin/Manager/:adminID/:category?/:name?/:questions?",
  (req, res, next) => {
    Server_Logic.Admin_Manager_Data_Delete(req, res, () => {});
  }
);

app.post("/admin/Director", (req, res, next) => {
  Server_Logic.Admin_Director_Insert_Data(req, res, () => {});
});
app.get("/admin/Director", (req, res, next) => {
  Server_Logic.Admin_Director_Retrive_Data(req, res, () => {});
});
app.delete(
  "/admin/Director/:adminID/:category?/:name?/:questions?",
  (req, res, next) => {
    Server_Logic.Admin_Director_Data_Delete(req, res, () => {});
  }
);
//Save-Data
app.post("/save/EmpoyeeDataKPI", (req, res, next) => {
  Server_Logic.Save_Employee_Insert_Data(req, res, () => {});
});
app.get("/save/EmpoyeeDataKPI/:Empid?/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Save_Employee_Retrive_Data(req, res, () => {});
});
app.put("/save/EmpoyeeDataKPI/:Empid", (req, res, next) => {
  Server_Logic.Save_Employee_Data_Update(req, res, () => {});
});
app.delete("/save/EmpoyeeDataKPI/:Empid", (req, res, next) => {
  Server_Logic.Save_Employee_Data_Delete(req, res, () => {});
});
app.post("/save/ManagerDataKPI", (req, res, next) => {
  Server_Logic.Save_Manager_Insert_Data(req, res, () => {});
});
app.get("/save/ManagerDataKPI/:Empid?/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Save_Manager_Retrive_Data(req, res, () => {});
});
app.put("/save/ManagerDataKPI/:Empid", (req, res, next) => {
  Server_Logic.Save_Manager_Data_Update(req, res, () => {});
});
app.delete("/save/ManagerDataKPI/:Empid", (req, res, next) => {
  Server_Logic.Save_Manager_Data_Delete(req, res, () => {});
});
app.post("/save/DirectorDataKPI", (req, res, next) => {
  Server_Logic.Save_Director_Insert_Data(req, res, () => {});
});
app.get("/save/DirectorDataKPI/:Empid?/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Save_Director_Retrive_Data(req, res, () => {});
});
app.put("/save/DirectorDataKPI/:Empid", (req, res, next) => {
  Server_Logic.Save_Director_Update_Data(req, res, () => {});
});
app.delete("/save/DirectorDataKPI/:Empid", (req, res, next) => {
  Server_Logic.Save_Director_Delete_Data(req, res, () => {});
});
//Employee-Data
app.post("/api/EmpoyeeDataKPI", (req, res, next) => {
  Server_Logic.Employee_Insert_Data(req, res, () => {});
});
app.get("/api/EmployeeDataKPI/:Empid/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Employee_Retrive_Data(req, res, () => {});
});
app.put("/api/EmployeeDataKPI/:Empid/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Employee_Data_Update(req, res, () => {});
});
app.get("/api/EmployeeAllDataKPI/:Empid?/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Employee_All_Data_Retrieve(req, res, () => {});
});
app.put("/api/EmployeeStatus/:Empid", (req, res, next) => {
  Server_Logic.Employee_Status_Update(req, res, () => {});
});
app.get("/api/EmployeeAllStatusKPI/:Empid?", (req, res, next) => {
  Server_Logic.Employee_All_Status_Retrieve(req, res, () => {});
});

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    let result;

    if (event.path === "/admin/RegisterKPI" && event.httpMethod === "POST") {
      result = Server_Logic.AdminPost(body);
    } else if (
      event.path === "/admin/LoginKPI" &&
      event.httpMethod === "POST"
    ) {
      result = Server_Logic.AdminloginPost(body);
    } else if (
      event.path === "/admin/Employee" &&
      event.httpMethod === "POST"
    ) {
      result = Server_Logic.Admin_Employee_Insert_Data(body);
    } else if (event.path === "/admin/Employee" && event.httpMethod === "GET") {
      result = Server_Logic.Admin_Employee_Retrive_Data(body);
    } else if (
      event.path === "/admin/Employee/:adminID/:category?/:name?/:questions?" &&
      event.httpMethod === "DELETE"
    ) {
      result = Server_Logic.Admin_Employee_Delete_Data(body);
    } else if (event.path === "/admin/Manager" && event.httpMethod === "POST") {
      result = Server_Logic.Admin_Manager_Insert_Data(body);
    } else if (event.path === "/admin/Manager" && event.httpMethod === "GET") {
      result = Server_Logic.Admin_Manager_Retrive_Data(body);
    } else if (
      event.path === "/admin/Manager/:adminID/:category?/:name?/:questions?" &&
      event.httpMethod === "DELETE"
    ) {
      result = Server_Logic.Admin_Manager_Data_Delete(body);
    } else if (
      event.path === "/save/EmpoyeeDataKPI" &&
      event.httpMethod === "POST"
    ) {
      result = Server_Logic.Save_Employee_Insert_Data(body);
    } else if (
      event.path === "/saveEmpoyeeDataKPI/:Empid?/:Value?/:Name?" &&
      event.httpMethod === "GET"
    ) {
      result = Server_Logic.Save_Employee_Retrive_Data(body);
    } else if (
      event.path === "/save/EmpoyeeDataKPI/:Empid" &&
      event.httpMethod === "UPDATE"
    ) {
      result = Server_Logic.Save_Employee_Data_Update(body);
    } else if (
      event.path === "/save/EmpoyeeDataKPI/:Empid" &&
      event.httpMethod === "DELETE"
    ) {
      result = Server_Logic.Save_Employee_Data_Delete(body);
    } else if (
      event.path === "/save/ManagerDataKPI" &&
      event.httpMethod === "POST"
    ) {
      result = Server_Logic.Save_Manager_Insert_Data(body);
    } else if (
      event.path === "/save/ManagerDataKPI/:Empid?/:Value?/:Name?" &&
      event.httpMethod === "GET"
    ) {
      result = Server_Logic.Save_Manager_Retrive_Data(body);
    } else if (
      event.path === "/save/ManagerDataKPI/:Empid" &&
      event.httpMethod === "UPDATE"
    ) {
      result = Server_Logic.Save_Manager_Data_Update(body);
    } else if (
      event.path === "/save/ManagerDataKPI/:Empid" &&
      event.httpMethod === "DELETE"
    ) {
      result = Server_Logic.Save_Manager_Data_Delete(body);
    } else if (
      event.path === "/api/EmpoyeeDataKPI" &&
      event.httpMethod === "POST"
    ) {
      result = Server_Logic.Employee_Insert_Data(body);
    } else if (
      event.path === "/api/EmployeeDataKPI/:Empid/:Value?/:Name?" &&
      event.httpMethod === "GET"
    ) {
      result = Server_Logic.Employee_Retrive_Data(body);
    } else if (
      event.path === "/api/EmployeeDataKPI/:Empid/:Value?/:Name?" &&
      event.httpMethod === "UPDATE"
    ) {
      result = Server_Logic.Employee_Data_Update(body);
    } else if (
      event.path === "/api/EmployeeAllDataKPI/:Empid?/:Value?/:Name?" &&
      event.httpMethod === "GET"
    ) {
      result = Server_Logic.Employee_All_Data_Retrieve(body);
    } else if (
      event.path === "/api/EmployeeStatus/:Empid" &&
      event.httpMethod === "UPDATE"
    ) {
      result = Server_Logic.Employee_Status_Update(body);
    } else if (
      event.path === "/api/EmployeeAllStatusKPI/:Empid?" &&
      event.httpMethod === "GET"
    ) {
      result = Server_Logic.Employee_All_Status_Retrieve(body);
    } else {
      throw new Error("Invalid endpoint");
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers: {
        "Content-Type": "application/json",
        // CORS headers to allow requests from any origin
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS, POST, GET, PUT, DELETE", // Include the necessary HTTP methods
      },
    };
  } catch (error) {
    console.error("Error handling Lambda event:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
      headers: {
        "Content-Type": "application/json",
        // CORS headers to allow requests from any origin
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS, POST, GET, PUT, DELETE", // Include the necessary HTTP methods
      },
    };
  }
};

app.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`);
});
