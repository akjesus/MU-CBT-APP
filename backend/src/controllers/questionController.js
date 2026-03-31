const db = require("../config/database");
const csv = require("csv-parser");
const fs = require("fs");
const stream = require("stream");
const Exam = require("../models/Exam");

exports.getAllQuestions = async (req, res) => {
  const { course_id } = req.query;

  try {
    let sql = "SELECT * FROM questions";
    let params = [];

    if (course_id) {
      sql += " WHERE course_id = ?";
      params.push(course_id);
    }

    const [questions] = await db.query(sql, params);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllQuestionsForCourse = async (req, res) => {
  const { course_id } = req.params; // Get course_id from query params
  console.log(course_id);

  try {
    const [questions] = await db.query(
      "SELECT * FROM questions WHERE course_id = ?",
      [course_id],
    );
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const [question] = await db.query("SELECT * FROM questions WHERE id = ?", [
      req.params.id,
    ]);
    if (!question.length)
      return res.status(404).json({ error: "Question not found" });
    res.json(question[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create Question  and add to exam (If exam_id provided in body, else just add to Question Bank)
exports.createQuestionAndAddtoExam = async (req, res) => {
  try {
    const {
      text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      score_obtainable,
      instructions,
    } = req.body.question;
    const user_id = req.user.id;
    const { exam_id } = req.params;
    const { course_id } = req.body;

    const [result] = await db.query(
      "INSERT INTO questions (course_id, text, option_a, option_b, option_c, option_d, correct_option, score_obtainable, instructions, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
      [
        course_id,
        text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        score_obtainable,
        instructions,
        user_id,
      ],
    );
    console.log(req.body, req.params, user_id, result.insertId);
    await db.query(
      "INSERT INTO exam_questions (exam_id, question_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
      [exam_id, result.insertId],
    );
    res.status(201).json({
      message: "Question added to Question Bank",
      id: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const {
      course_id,
      text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      instructions,
      difficulty_level,
      question_type,
      score_obtainable,
      level,
      file,
      answers,
      user_id,
    } = req.body;
    // Check if question exists
    const [existingQuestion] = await db.query(
      "SELECT * FROM questions WHERE id = ?",
      [questionId],
    );
    if (!existingQuestion.length) {
      return res.status(404).json({ error: "Question not found" });
    }

    let fullPath;
    if (req.files && req.files.file) {
      const uploadedFile = req.files.file;
      // Save to frontend/public/uploads so it is accessible from the browser
      const path = require("path");
      const uploadDir = path.resolve(
        __dirname,
        "../../../frontend/public/uploads",
      );
      try {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
      } catch (dirErr) {
        console.error("Error creating upload directory:", uploadDir, dirErr);
        return res.status(500).json({
          error: "Failed to create upload directory",
          details: dirErr.message,
        });
      }
      // Generate unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileExt = uploadedFile.name.split(".").pop();
      const filename = `question_${uniqueSuffix}.${fileExt}`;
      filePath = `uploads/${filename}`; // relative to public
      fullPath = path.join(uploadDir, filename);
      try {
        fs.writeFileSync(fullPath, uploadedFile.data);
        console.log("File saved successfully:", fullPath);
      } catch (fileErr) {
        console.error("Error saving file:", fullPath, fileErr);
        return res
          .status(500)
          .json({ error: "Failed to save file", details: fileErr.message });
      }
    } else {
      console.warn("No file found in req.files:", req.files);
    }

    await db.query(
      `UPDATE questions 
             SET course_id = ?, text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, 
                 correct_option = ?, instructions = ?, difficulty_level = ?, question_type = ?, score_obtainable = ?, 
                 level = ?, file = ?, answers = ?, user_id = ?, updated_at = NOW() 
             WHERE id = ?`,
      [
        course_id,
        text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        instructions,
        difficulty_level,
        question_type,
        score_obtainable,
        level,
        fullPath,
        answers,
        user_id,
        questionId,
      ],
    );

    res.json({ message: "Question updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const [existingQuestion] = await db.query(
      "SELECT * FROM questions WHERE id = ?",
      [questionId],
    );
    if (!existingQuestion.length) {
      return res.status(404).json({ error: "Question not found" });
    }
    await db.query("DELETE FROM exam_questions WHERE question_id = ?", [
      questionId,
    ]);
    await db.query("DELETE FROM questions WHERE id = ?", [questionId]);

    res
      .status(200)
      .json({ success: true, message: "Question deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Assign an existing question to an exam
exports.addQuestionToExam = async (req, res) => {
  try {
    const { question_id } = req.body;
    const examId = req.params.exam_id;
    await db.query(
      "INSERT INTO exam_questions (exam_id, question_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
      [examId, question_id],
    );
    res.status(201).json({ message: "Question assigned to Exam successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Bulk Upload Questions (Question Bank Only)
exports.bulkUploadQuestions = async (req, res) => {
  const { course_id } = req.body;
  try {
    if (!req.file && !req.files.file)
      return res.status(400).json({ error: "No file uploaded" });
    const csvFile = req.files.file;
    const bufferStream = new stream.PassThrough();
    bufferStream.end(csvFile.data);

    const questions = [];
    bufferStream
      .pipe(csv())
      .on("data", (row) => {
        // console.log(row[0]); // Debugging line to check the first column of each row
        questions.push([
          course_id,
          row.text,
          row.option_a,
          row.option_b,
          row.option_c,
          row.option_d,
          row.correct_option,
          row.instructions,
          row.score_obtainable,
          row.level,
        ]);
      })
      .on("end", async () => {
        console.log(questions);
        await db.query(
          "INSERT INTO questions (course_id, text, option_a, option_b, option_c, option_d, correct_option, instructions, score_obtainable, level, created_at, updated_at) VALUES ?",
          [questions.map((q) => [...q, new Date(), new Date()])],
        );
        res.json({ message: "Bulk Questions uploaded successfully" });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Bulk Upload Exam Questions (Assign to Exam & Question Bank)
exports.bulkUploadExamQuestions = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const examId = req.params.exam_id;
    const questions = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        questions.push([
          examId,
          row.course_id,
          row.text,
          row.option_a,
          row.option_b,
          row.option_c,
          row.option_d,
          row.correct_option,
          row.instructions,
          row.difficulty_level,
          row.question_type,
          row.score_obtainable,
          row.level,
          row.file,
          row.answers,
          row.user_id,
        ]);
      })
      .on("end", async () => {
        const [result] = await db.query(
          "INSERT INTO questions (course_id, text, option_a, option_b, option_c, option_d, correct_option, instructions, difficulty_level, question_type, score_obtainable, level, file, answers, user_id, created_at, updated_at) VALUES ?",
          [questions.map((q) => [...q, new Date(), new Date()])],
        );

        const questionIds = Array.from(
          { length: result.affectedRows },
          (_, i) => result.insertId + i,
        );
        const examQuestions = questionIds.map((qId) => [examId, qId]);

        await db.query(
          "INSERT INTO exam_questions (exam_id, question_id, created_at, updated_at) VALUES ?",
          [examQuestions.map((q) => [...q, new Date(), new Date()])],
        );

        res.json({
          message: "Bulk Exam Questions uploaded and assigned successfully",
        });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeQuestionFromDB = async (req, res) => {
  try {
    const { question_id } = req.params;

    // 1) remove from exam_questions
    await db.query("DELETE FROM exam_questions WHERE question_id = ?", [
      question_id,
    ]);

    // 2) remove from questions
    const [result] = await db.query("DELETE FROM questions WHERE id = ?", [
      question_id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.json({
      message:
        "Question removed from database (and exam_questions) successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
