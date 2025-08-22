const path = require("path");
const notifier = require("node-notifier");
const router = require('express').Router()
const db = require("../config/database");


router.post("/", async (req, res)=> {
     try {
        const ip_address = req.ip;
        const {
          first_name,
          last_name,
          department_name,
          exam_name,
          registration_number,
        } = req.body;
        const alert = "Opened other Tabs/Windows";
        notifier.notify({
          title: "Possible Malpractice Alert!!",
          icon: path.join(__dirname, "../logo.png"),
          message: `${first_name} ${last_name}: ${registration_number} with IP: ${ip_address} has switched tabs more than 5 times`,
          sound: true,
          wait: false,
        });

        await db.query(
          `
        INSERT INTO notifications (exam_name, student_name, registration_number, department, 
        ip_address, alert, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            exam_name,
            `${first_name} ${last_name}`,
            registration_number,
            department_name,
            ip_address,
            alert,
          ]
        );
        return res.status(200).json({ message: "received" });

     }
     catch(error) {
        console.log(error)
        return res.status(400).json(error)
     }
        
})

router.get("/" , async(req, res)=> {

  try {
 const [data] = await db.query(`select * from notifications`);
 return res.status(200).json(data)
  
  }
 catch(error) {
  console.log(error);
  return res.status(400).json(error)
 }

})


module.exports = router