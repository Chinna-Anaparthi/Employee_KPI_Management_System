const express = require("express");
const Server_Logic = require("./ServerLogic");
const app = express();
var parser = require("body-parser");
app.use(parser.json());
const cors = require("cors");
app.use(cors());
const port = 2000;

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
app.put("/save/emp_upd/:Empid", (req, res, next) => {
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
//Employee-Data
app.post("/api/emp_insrt", (req, res, next) => {
  Server_Logic.Employee_Insert_Data(req, res, () => {});
});
app.get("/api/emp_data/:Empid/:Value?/:Name?", (req, res, next) => {
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

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    let result;

    if (event.path === "/admin/register" && event.httpMethod === "POST") {
      result = Server_Logic.AdminPost(body);
    } else if (
      event.path === "/admin/login" &&
      event.httpMethod === "POST"
    ) {
      result = Server_Logic.AdminloginPost(body);
    } else if (
      event.path === "/admin/emp_insrt" &&
      event.httpMethod === "POST"
    ) {
      result = Server_Logic.Admin_Employee_Insert_Data(body);
    } else if (event.path === "/admin/emp_data" && event.httpMethod === "GET") {
      result = Server_Logic.Admin_Employee_Retrive_Data(body);
    } else if (
      event.path === "/admin/emp_del/:adminID/:category?/:name?/:questions?" &&
      event.httpMethod === "DELETE"
    ) {
      result = Server_Logic.Admin_Employee_Delete_Data(body);
    } else if (event.path === "/admin/manager_insrt" && event.httpMethod === "POST") {
      result = Server_Logic.Admin_Manager_Insert_Data(body);
    } else if (event.path === "/admin/manager_data" && event.httpMethod === "GET") {
      result = Server_Logic.Admin_Manager_Retrive_Data(body);
    } else if (
      event.path === "/admin/manager_del/:adminID/:category?/:name?/:questions?" &&
      event.httpMethod === "DELETE"
    ) {
      result = Server_Logic.Admin_Manager_Data_Delete(body);
    } 
    
    else if (
      event.path === "/save/emp_insrt" &&
      event.httpMethod === "POST"
    ) {
      result = Server_Logic.Save_Employee_Insert_Data(body);
    } else if (
      event.path === "/save/emp_data/:Empid?/:Value?/:Name?" &&
      event.httpMethod === "GET"
    ) {
      result = Server_Logic.Save_Employee_Retrive_Data(body);
    } else if (
      event.path === "/save/emp_upd/:Empid" &&
      event.httpMethod === "UPDATE"
    ) {
      result = Server_Logic.Save_Employee_Data_Update(body);
    } else if (
      event.path === "/save/emp_del/:Empid" &&
      event.httpMethod === "DELETE"
    ) {
      result = Server_Logic.Save_Employee_Data_Delete(body);
    } 
    
    else if (
      event.path === "/save/manager_insrt" &&
      event.httpMethod === "POST"
    ) {
      result = Server_Logic.Save_Manager_Insert_Data(body);
    } else if (
      event.path === "/save/manager_data/:Empid?/:Value?/:Name?" &&
      event.httpMethod === "GET"
    ) {
      result = Server_Logic.Save_Manager_Retrive_Data(body);
    } else if (
      event.path === "/save/manager_upd/:Empid" &&
      event.httpMethod === "UPDATE"
    ) {
      result = Server_Logic.Save_Manager_Data_Update(body);
    } else if (
      event.path === "/save/manager_del/:Empid" &&
      event.httpMethod === "DELETE"
    ) {
      result = Server_Logic.Save_Manager_Data_Delete(body);
    }
    
    
    
    else if (
      event.path === "/api/emp_insrt" &&
      event.httpMethod === "POST"
    ) {
      result = Server_Logic.Employee_Insert_Data(body);
    } else if (
      event.path === "/api/emp_data/:Empid/:Value?/:Name?" &&
      event.httpMethod === "GET"
    ) {
      result = Server_Logic.Employee_Retrive_Data(body);
    } else if (
      event.path === "/api/emp_upd/:Empid/:Value?/:Name?" &&
      event.httpMethod === "UPDATE"
    ) {
      result = Server_Logic.Employee_Data_Update(body);
    } else if (
      event.path === "/api/emp_all_data/:Empid?/:Value?/:Name?" &&
      event.httpMethod === "GET"
    ) {
      result = Server_Logic.Employee_All_Data_Retrieve(body);
    } else if (
      event.path === "/api/emp_status_upd/:Empid" &&
      event.httpMethod === "UPDATE"
    ) {
      result = Server_Logic.Employee_Status_Update(body);
    } else if (
      event.path === "/api/emp_all_status_data/:Empid?" &&
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
