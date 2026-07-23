const db = require("../config/database");
const csvParser = require("csv-parser");
const stream = require("stream");
const BlockList = require("../models/BlockList");

exports.getBlockList = async (req, res) => {
  try {
    const blockList = await BlockList.getAll();
    res.json(blockList);
  } catch (err) {
    console.error("Get Block List Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getBlockListById = async (req, res) => {
  try {
    const block = await BlockList.getById(req.params.id);
    if (!block) {
      return res.status(404).json({ error: "Block entry not found" });
    }
    res.json(block);
  } catch (err) {
    console.error("Get Block List By ID Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.addStudentToBlockList = async (req, res) => {
  try {
    const { registration_number } = req.body;
    if (!registration_number) {
      return res.status(400).json({ error: "Invalid Matric Number" });
    }
    const newId = await BlockList.create(registration_number);
    res.status(201).json({ id: newId, message: "Student added to block list" });
  } catch (err) {
    console.error("Add Student To Block List Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.bulkUploadBlockList = async (req, res) => {
  try {
    let examId = null;
    if (req.body.exam_id) {
      examId = req.body.exam_id;
    }
    const csvFile = req.file;
    if (!csvFile) {
      return res.status(400).json({ error: "No CSV file uploaded" });
    }
    const bufferStream = new stream.PassThrough();
    bufferStream.end(csvFile.buffer);

    const blockList = [];
    bufferStream
      .pipe(csvParser())
      .on("data", (row) => {
        const { registration_number } = row;
        blockList.push({ registration_number });
      })
      .on("end", async () => {
        if (!blockList.length) {
          console.log("No valid registration numbers rows found in CSV");
          return res
            .status(400)
            .json({ error: "No valid registration numbers rows found in CSV" });
        }
        let insertedCount = 0;
        for (const qRow of blockList) {
          const existing = await BlockList.getByMatricNo(
            qRow.registration_number,
          );
          if (existing) {
            console.log(
              `Student with registration number ${qRow.registration_number} already exists in the blocklist.`,
            );
            continue;
          }
          try {
            await db.query(
              `INSERT INTO blocklist 
                 (registration_number, exam_id, created_at)
               VALUES (?, ?, NOW())`,
              [qRow.registration_number, examId],
            );
            insertedCount++;
          } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: err.message });
          }
        }

        res.status(201).json({
          message: `${insertedCount} new students added to blocklist`,
        });
      });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.removeFromBlockList = async (req, res) => {
  try {
    const block = await BlockList.getById(req.params.id);
    if (!block) {
      return res.status(404).json({ error: "Block entry not found" });
    }
    await BlockList.delete(req.params.id);
    res.json({ message: "Student removed from block list" });
  } catch (err) {
    console.error("Remove From Block List Error:", err);
    res.status(500).json({ error: err.message });
  }
};
