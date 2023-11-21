const express = require("express");
const Server_Logic = require('./ServerLogic')
const app = express();
var parser = require("body-parser");
app.use(parser.json());
const cors = require("cors");
app.use(cors());
const port = 2000;


//Admin-Data
app.post("/AdminRegistrationKPI", (req, res, next) => {
  Server_Logic.AdminPost(req, res, () => { });
})
app.post("/AdminLoginKPI", (req, res, next) => {
  Server_Logic.AdminloginPost(req, res, () => { });
})
app.post("/AdminEmployeePost", (req, res, next) => {
  Server_Logic.Admin_Employee_Insert_Data(req, res, () => { }); 
})
app.get("/AdminEmployeeGet", (req, res, next) => {
  Server_Logic.Admin_Employee_Retrive_Data(req, res, () => { }); 
})
app.delete("/AdminEmployeeDelete/:adminID/:category?/:name?/:questions?", (req, res, next) => {
  Server_Logic.Admin_Employee_Delete_Data(req, res, () => { });
});

app.post("/AdminManagerPost", (req, res, next) => {
  Server_Logic.Admin_Manager_Insert_Data(req, res, () => { }); 
})
app.get("/AdminManagerGet", (req, res, next) => {
  Server_Logic.Admin_Manager_Retrive_Data(req, res, () => { }); 
})
app.delete("/AdminManagerDelete/:adminID/:category?/:name?/:questions?", (req, res, next) => {
  Server_Logic.Admin_Manager_Data_Delete(req, res, () => { });
});

app.post("/AdminDirectorPost", (req, res, next) => {
  Server_Logic.Admin_Director_Insert_Data(req, res, () => { }); 
})
app.get("/AdminDirectorGet", (req, res, next) => {
  Server_Logic.Admin_Director_Retrive_Data(req, res, () => { }); 
})
app.delete("/AdminDirectorDelete/:adminID/:category?/:name?/:questions?", (req, res, next) => {
  Server_Logic.Admin_Director_Data_Delete(req, res, () => { });
});
//Save-Data
app.post("/SaveEmpoyeeDataKPIPost", (req, res, next) => {
  Server_Logic.Save_Employee_Insert_Data(req, res, () => { });
});
app.get("/SaveEmpoyeeDataKPIGet/:Empid?/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Save_Employee_Retrive_Data(req, res, () => { });
});
app.put("/SaveEmpoyeeDataKPIUpdate/:Empid", (req, res, next) => {
  Server_Logic.Save_Employee_Data_Update(req, res, () => { });
});
app.delete("/SaveEmpoyeeDataKPIDelete/:Empid", (req, res, next) => {
  Server_Logic.Save_Employee_Data_Delete(req, res, () => { });
});
app.post("/SaveManagerDataKPIPost", (req, res, next) => { 
  Server_Logic.Save_Manager_Insert_Data(req, res, () => { }); 
});
app.get("/SaveManagerDataKPIGet/:Empid?/:Value?/:Name?", (req, res, next) => {
  Server_Logic.Save_Manager_Retrive_Data(req, res, () => { });
});
app.put("/SaveManagerDataKPIUpdate/:Empid", (req, res, next) => {
  Server_Logic.Save_Manager_Data_Update(req, res, () => { });
});
app.delete("/SaveManagerDataKPIDelete/:Empid", (req, res, next) => {
  Server_Logic.Save_Manager_Data_Delete(req, res, () => { });
});
app.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`);
});
