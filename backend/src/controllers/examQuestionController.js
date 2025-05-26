const db = require("../config/database");
const csvParser = require("csv-parser");
const stream = require("stream");


/**
 * 1. GET all questions linked to a specific exam
 */
exports.getQuestionsByExam = async (req, res) => {
  try {
    const { exam_id } = req.params;
    const [rows] = await db.query(
      `SELECT q.id AS question_id, q.course_id, q.text, q.option_a, q.option_b, q.option_c,
              q.option_d, q.correct_option, q.difficulty_level, q.question_type, q.score_obtainable,
              q.level, q.file, q.answers, q.user_id
       FROM exam_questions eq
       JOIN questions q ON eq.question_id = q.id
       WHERE eq.exam_id = ?`,
      [exam_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 2. Link an *EXISTING* question_id to an exam
 */
exports.addQuestionToExam = async (req, res) => {
  try {
    const { exam_id, question_id } = req.body;
    if (!exam_id || !question_id) {
      return res
        .status(400)
        .json({ error: "exam_id and question_id are required" });
    }

    // Check if it already exists
    const [existing] = await db.query(
      `SELECT id FROM exam_questions WHERE exam_id = ? AND question_id = ?`,
      [exam_id, question_id]
    );
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ error: "This question is already linked to the exam" });
    }

    // Insert new link
    await db.query(
      `INSERT INTO exam_questions (exam_id, question_id) VALUES (?, ?)`,
      [exam_id, question_id]
    );
    res.status(201).json({ message: "Question linked to exam successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 3. ADD A BRAND-NEW QUESTION to `questions`, then link it to exam_questions
 *    We expect the request body to have all question fields + exam_id
 *    for the new question. E.g.:
 *    {
 *      exam_id: 123,
 *      course_id: 5,
 *      text: "...",
 *      option_a: "...",
 *      ...
 *    }
 */
exports.addNewQuestionAndLinkToExam = async (req, res) => {
  try {
    const { exam_id } = req.body;
    if (!exam_id) {
      return res.status(400).json({ error: "exam_id is required" });
    }

    // Extract question fields from request body
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
      user_id
    } = req.body;

    // Insert into `questions` table
    const [result] = await db.query(
      `INSERT INTO questions 
          (course_id, text, option_a, option_b, option_c, option_d, correct_option,
           difficulty_level, question_type, score_obtainable, level, file, answers, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        user_id
      ]
    );

    const newQuestionId = result.insertId;

    // Link the newly inserted question to the exam
    await db.query(
      `INSERT INTO exam_questions (exam_id, question_id) VALUES (?, ?)`,
      [exam_id, newQuestionId]
    );

    res.status(201).json({
      message: "New question created and linked to exam",
      question_id: newQuestionId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 4. Bulk CSV upload: each row has question fields (except created_at, updated_at).
 *    We create a new question for each row, then link it to exam_id.
 * 
 *    Format example CSV:
 *      exam_id, course_id, text, option_a, option_b, option_c, option_d, correct_option, difficulty_level, question_type, score_obtainable, level, file, answers, user_id
 *    We skip created_at, updated_at
 * 
 */
exports.bulkUploadNewQuestions = async (req, res) => {
  try {
    const { exam_id } = req.params;
    if (!exam_id) {
      return res.status(400).json({ error: "No exam_id in URL" });
    }

    // Check if file is present
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "CSV file is required" });
    }

    const csvFile = req.files.file;
    const bufferStream = new stream.PassThrough();
    bufferStream.end(csvFile.data);

    const questionsToInsert = []; // for question fields
    // We'll store them as arrays of [course_id, text, ... user_id], then link after

    bufferStream
      .pipe(csvParser())
      .on("data", (row) => {
        // Extract the fields from CSV row
        // We'll parse them carefully, assuming columns are consistent
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
          user_id
        } = row;

        // We'll store this row data
        questionsToInsert.push({
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
          user_id
        });
      })
      .on("end", async () => {
        if (!questionsToInsert.length) {
          return res
            .status(400)
            .json({ error: "No valid question rows found in CSV" });
        }

        let insertedCount = 0;

        // We'll process each question row individually
        for (const qRow of questionsToInsert) {
          // Insert new question
          const [insertRes] = await db.query(
            `INSERT INTO questions 
               (course_id, text, option_a, option_b, option_c, option_d, correct_option,
                difficulty_level, question_type, score_obtainable, level, file, answers, user_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              qRow.course_id,
              qRow.text,
              qRow.option_a,
              qRow.option_b,
              qRow.option_c,
              qRow.option_d,
              qRow.correct_option,
              qRow.difficulty_level,
              qRow.question_type,
              qRow.score_obtainable,
              qRow.level,
              qRow.file,
              qRow.answers,
              qRow.user_id
            ]
          );

          const newQId = insertRes.insertId;

          // Link to exam_questions
          await db.query(
            `INSERT INTO exam_questions (exam_id, question_id) VALUES (?, ?)`,
            [exam_id, newQId]
          );

          insertedCount++;
        }

        res.status(201).json({
          message: `${insertedCount} new questions created & linked to exam`
        });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 5. Remove a single question from exam
 */
exports.removeQuestionFromExam = async (req, res) => {
  try {
    const { exam_id, question_id } = req.params;

    const [result] = await db.query(
      `DELETE FROM exam_questions WHERE exam_id = ? AND question_id = ?`,
      [exam_id, question_id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "No matching question found for this exam" });
    }

    res.json({ message: "Question removed from exam successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 6. Remove all questions from an exam
 */
exports.removeAllQuestionsFromExam = async (req, res) => {
  try {
    const { exam_id } = req.params;
    await db.query(
      `DELETE FROM exam_questions WHERE exam_id = ?`,
      [exam_id]
    );
    res.json({ message: "All questions removed from exam successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
