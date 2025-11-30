const db = require("../config/database");
const Attendance = require("../models/Attendance");

exports.markAttendance = async (req, res) => {  
    try {
        const { student_id, exam_id } = req.body;
        const ip_address = req.ip;
        if (!student_id || !exam_id) {
            return res.status(400).json({code: 400, message: "Incomplete Data!"});
        }
        const mark = await Attendance.markAttendance(student_id, exam_id, ip_address);
        if(mark) {
            return res.status(201).json({code: 201, message: "Attendance Marked!"})
        }
        return
    }
    catch (error) {
        console.log(error)
         return res.status(500).json({code: 500, message: "There was an error"});

    }
}

exports.getAllAttendance = async (req, res) => {  
    try {
        const attendanceRecords = await Attendance.getAllAttendance();   
        return res.status(200).json(attendanceRecords);
    }
    catch (error) {
        console.log(error)
         return res.status(500).json({code: 500, message: "There was an error"});

    }
}

exports.signOutStudent = async (req, res) => {
    try {
        const { student_id, exam_id } = req.body;   
        if (!student_id || !exam_id) {
            return res.status(400).json({code: 400, message: "Incomplete Data!"});
        }
        const result = await Attendance.signOutStudent(student_id, exam_id);
        if(result.affectedRows > 0) {
            return res.status(200).json({code: 200, message: "Student Signed Out!"})    
        } else {
            return res.status(404).json({code: 404, message: "Attendance Record Not Found!"});
        }
    }
    catch (error) {
        console.log(error)
         return res.status(500).json({code: 500, message: "There was an error"});
    }
}
