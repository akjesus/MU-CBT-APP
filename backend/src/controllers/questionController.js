const db = require("../config/database");
const csv = require("csv-parser");
const fs = require("fs");
const stream = require("stream");

exports.getAllQuestions = async (req, res) => {
  const { course_id } = req.query; // Get course_id from query params

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
  console.log(course_id)

  try {
  
    const [questions] = await db.query(
      "SELECT * FROM questions WHERE course_id = ?",
      [course_id]
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

// Add question to Question Bank only
exports.createQuestion = async (req, res) => {
  try {
    const {
      course_id,
      text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      difficulty_level,
      question_type,
      score_obtainable,
      level,
      file,
      answers,
      user_id,
    } = req.body;
    const [result] = await db.query(
      "INSERT INTO questions (course_id, text, option_a, option_b, option_c, option_d, correct_option, difficulty_level, question_type, score_obtainable, level, file, answers, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
      [
        course_id,
        text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        difficulty_level,
        question_type,
        score_obtainable,
        level,
        file,
        answers,
        user_id,
      ]
    );
    res
      .status(201)
      .json({
        message: "Question added to Question Bank",
        id: result.insertId,
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
      [questionId]
    );
    if (!existingQuestion.length) {
      return res.status(404).json({ error: "Question not found" });
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
        file,
        answers,
        user_id,
        questionId,
      ]
    );

    res.json({ message: "Question updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;

    // Check if question exists
    const [existingQuestion] = await db.query(
      "SELECT * FROM questions WHERE id = ?",
      [questionId]
    );
    if (!existingQuestion.length) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Remove question from all associated exams (exam_questions table)
    await db.query("DELETE FROM exam_questions WHERE question_id = ?", [
      questionId,
    ]);

    // Delete question from the Question Bank
    await db.query("DELETE FROM questions WHERE id = ?", [questionId]);

    res.json({ message: "Question deleted successfully" });
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
      [examId, question_id]
    );
    res.status(201).json({ message: "Question assigned to Exam successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Bulk Upload Questions (Question Bank Only)
exports.bulkUploadQuestions = async (req, res) => {
    const {course_id} = req.body;
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
          [questions.map((q) => [...q, new Date(), new Date()])]
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
                    row.user_id
                ]);
            })
            .on("end", async () => {
                const [result] = await db.query(
                    "INSERT INTO questions (course_id, text, option_a, option_b, option_c, option_d, correct_option, instructions, difficulty_level, question_type, score_obtainable, level, file, answers, user_id, created_at, updated_at) VALUES ?",
                    [questions.map(q => [...q, new Date(), new Date()])]
                );

                const questionIds = Array.from({ length: result.affectedRows }, (_, i) => result.insertId + i);
                const examQuestions = questionIds.map(qId => [examId, qId]);

                await db.query("INSERT INTO exam_questions (exam_id, question_id, created_at, updated_at) VALUES ?", [examQuestions.map(q => [...q, new Date(), new Date()])]);

                res.json({ message: "Bulk Exam Questions uploaded and assigned successfully" });
            });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.removeQuestionFromDB = async (req, res) => {
    try {
      const { question_id } = req.params;
  
      // 1) remove from exam_questions
      await db.query("DELETE FROM exam_questions WHERE question_id = ?", [question_id]);
  
      // 2) remove from questions
      const [result] = await db.query("DELETE FROM questions WHERE id = ?", [question_id]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.json({ message: "Question removed from database (and exam_questions) successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  };
