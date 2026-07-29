const db = require("../config/database");
const csvParser = require("csv-parser");
const stream = require("stream");
const fs = require("fs");

/**
 * 1. GET all questions linked to a specific exam
 */
exports.getQuestionsByExam = async (req, res) => {
  try {
    const { exam_id } = req.params;
    const [randomRows] = await db.query(
      `SELECT display_question_randomly FROM exams WHERE id = ?`,
      [exam_id],
    );
    const shouldRandomize =
      randomRows?.[0]?.display_question_randomly === 1;
    const [rows] = await db.query(
      `SELECT q.id AS question_id, q.course_id, q.text, q.option_a, q.option_b, q.option_c,
              q.option_d, q.correct_option, q.instructions, q.difficulty_level, q.question_type, q.score_obtainable,
              q.level, q.file, q.answers, q.user_id
       FROM exam_questions eq
       JOIN questions q ON eq.question_id = q.id
       WHERE eq.exam_id = ?${shouldRandomize ? "\n       ORDER BY RAND()" : ""}`,
      [exam_id],
    );
    res.json(rows);
  } catch (err) {
    console.log(err);
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
      [exam_id, question_id],
    );
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ error: "This question is already linked to the exam" });
    }

    // Insert new link
    await db.query(
      `INSERT INTO exam_questions (exam_id, question_id) VALUES (?, ?)`,
      [exam_id, question_id],
    );
    res.status(201).json({ message: "Question linked to exam successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addNewQuestionAndLinkToExam = async (req, res) => {
  const path = require("path");
  try {
    const { exam_id } = req.body;
    if (!exam_id) {
      return res.status(400).json({ error: "exam_id is required" });
    }

    // Extract question fields from request body
    const {
      text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      instructions,
      score_obtainable,
      level,
    } = req.body;
    const normalizedCorrectOption = correct_option
      ? String(correct_option).trim().toUpperCase()
      : correct_option;
    if (
      !text ||
      !option_a ||
      !option_b ||
      !option_c ||
      !option_d ||
      !correct_option
    ) {
      return res
        .status(400)
        .json({ error: "Missing required question fields" });
    }
    const [course] = await db.query(
      `select course_id from exams where id = ${exam_id}`,
    );
    const { course_id } = course[0];
    // Handle file upload if present
    let filePath = null;
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
      const fullPath = path.join(uploadDir, filename);
      try {
        fs.writeFileSync(fullPath, uploadedFile.data);
      } catch (fileErr) {
        console.error("Error saving file:", fullPath, fileErr);
        return res
          .status(500)
          .json({ error: "Failed to save file", details: fileErr.message });
      }
    } else {
      console.warn("No file found in req.files:", req.files);
    }

    // Insert into `questions` table
    const [result] = await db.query(
      `INSERT INTO questions 
          (course_id, text, option_a, option_b, option_c, option_d, correct_option, instructions,
             score_obtainable, level, file) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        course_id,
        text,
        option_a,
        option_b,
        option_c,
        option_d,
        normalizedCorrectOption,
        instructions,
        score_obtainable,
        level,
        filePath,
      ],
    );

    const newQuestionId = result.insertId;

    // Link the newly inserted question to the exam
    await db.query(
      `INSERT INTO exam_questions (exam_id, question_id) VALUES (?, ?)`,
      [exam_id, newQuestionId],
    );

    res.status(201).json({
      message: "New question created and linked to exam",
      question_id: newQuestionId,
      file: filePath,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.bulkUploadNewQuestions = async (req, res) => {
  const replaceQuestionMarkWithArrow = (str) => {
    return str
      .replace(/\?(\d+)/g, "->$1")
      .replace(/\?/g, " ")
      .replace(/\^2/g, "²");
  };

  function replaceSuperscript(str) {
    return str.replace(/\^(\d+)/g, (match, exponent) =>
      getSuperscript(exponent),
    );
  }

  function getSuperscript(n) {
    const superscriptMap = {
      0: "⁰",
      1: "¹",
      2: "²",
      3: "³",
      4: "⁴",
      5: "⁵",
      6: "⁶",
      7: "⁷",
      8: "⁸",
      9: "⁹",
    };
    return n
      .toString()
      .split("")
      .map((digit) => superscriptMap[digit])
      .join("");
  }

  try {
    const { exam_id } = req.params;
    if (!exam_id) {
      console.log("No exam_id provided in URL");
      return res.status(400).json({ error: "No exam_id in URL" });
    }
    const [courseId] = await db.query(
      `SELECT course_id FROM exams WHERE id = ?`,
      [exam_id],
    );
    const course_id = courseId[0].course_id;
    if (!courseId || courseId.length === 0) {
      return res.status(404).json({ error: "Exam not found" });
    }
    // Check if file is present
    if (!req.file) {
      console.log("No file uploaded in request");
      return res.status(400).json({ error: "CSV file is required" });
    }

    const csvFile = req.file;
    const bufferStream = new stream.PassThrough();
    bufferStream.end(csvFile.buffer);

    const questionsToInsert = []; // for question fields
    bufferStream
      .pipe(csvParser())
      .on("data", (row) => {
        const {
          option_a,
          option_b,
          option_c,
          option_d,
          correct_option,
          instructions,
          score_obtainable,
        } = row;

        const firstText = replaceQuestionMarkWithArrow(row.text);
        const text = replaceSuperscript(firstText);
        questionsToInsert.push({
          course_id,
          text,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_option: correct_option
            ? String(correct_option).trim().toUpperCase()
            : correct_option,
          instructions,
          score_obtainable,
        });
      })
      .on("end", async () => {
        if (!questionsToInsert.length) {
          console.log("No valid question rows found in CSV");
          return res
            .status(400)
            .json({ error: "No valid question rows found in CSV" });
        }

        let insertedCount = 0;
        for (const qRow of questionsToInsert) {
          // Insert new question
          try {
            const [insertRes] = await db.query(
              `INSERT INTO questions 
               (course_id, text, option_a, option_b, option_c, option_d, correct_option, instructions, score_obtainable, level, file, answers)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                qRow.course_id,
                qRow.text,
                qRow.option_a,
                qRow.option_b,
                qRow.option_c,
                qRow.option_d,
                qRow.correct_option,
                qRow.instructions,
                qRow.score_obtainable,
                null,
                null,
                null,
              ],
            );

            const newQId = insertRes.insertId;

            await db.query(
              `INSERT INTO exam_questions (exam_id, question_id) VALUES (?, ?)`,
              [exam_id, newQId],
            );
          } catch (err) {
            return res.status(500).json({ error: err.message });
          }
          // Link to exam_questions

          insertedCount++;
        }

        res.status(201).json({
          message: `${insertedCount} new questions created & linked to exam`,
        });
      });
  } catch (err) {
    console.log(err.message);
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
      [exam_id, question_id],
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
    await db.query(`DELETE FROM exam_questions WHERE exam_id = ?`, [exam_id]);
    res.json({ message: "All questions removed from exam successfully" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
};
