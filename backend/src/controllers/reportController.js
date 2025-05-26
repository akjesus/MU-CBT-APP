const db = require("../config/database");

exports.getExamDetailedReport = async (req, res) => {
  try {
    const { exam_id } = req.params;
    const { department_id } = req.query;

    // 1) Get basic exam info
    const [examRows] = await db.query(
      `SELECT e.id AS exam_id, e.exam_name, e.max_score_obtainable, e.exam_date,
              c.name AS course_name
       FROM exams e
       JOIN courses c ON e.course_id = c.id
       WHERE e.id = ?`,
      [exam_id]
    );
    if (examRows.length === 0) {
      return res.status(404).json({ error: "Exam not found" });
    }
    const examInfo = examRows[0];

    // 2) Build results query
    let sql = `
      SELECT r.score AS score,
             s.id AS student_id,
             s.first_name,
             s.last_name,
             s.registration_number,
             d.id AS department_id,
             d.name AS department_name
      FROM results r
      JOIN students s ON r.student_id = s.id
      JOIN departments d ON s.department_id = d.id
      WHERE r.exam_id = ?
    `;
    const params = [exam_id];
    if (department_id) {
      sql += " AND s.department_id = ?";
      params.push(department_id);
    }

    const [resultRows] = await db.query(sql, params);

    // If no participants:
    if (resultRows.length === 0) {
      return res.json({
        examInfo,
        countParticipants: 0,
        minScore: null,
        maxScore: null,
        averageScore: null,
        distribution: [],
        departmentBreakdown: []
      });
    }

    // 3) Calculate min, max, average
    let minScore = Infinity;
    let maxScore = -Infinity;
    let totalScore = 0;

    resultRows.forEach(r => {
      const scoreVal = parseFloat(r.score) || 0;
      if (scoreVal < minScore) minScore = scoreVal;
      if (scoreVal > maxScore) maxScore = scoreVal;
      totalScore += scoreVal;
    });
    const countParticipants = resultRows.length;
    const averageScore = totalScore / countParticipants;

    // 4) (Optional) Score distribution: e.g. ranges of 10
    // This is just an example. Adjust as needed.
    const distributionRanges = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const distribution = distributionRanges.map((low, i) => {
      if (i === distributionRanges.length - 1) return null; // no next range
      const high = distributionRanges[i+1];
      const label = `${low} - ${high - 1}`;
      const countInRange = resultRows.filter(r => {
        const sc = parseFloat(r.score) || 0;
        return sc >= low && sc < high;
      }).length;
      return { range: label, count: countInRange };
    }).filter(Boolean); // remove the null from last iteration

    // 5) Department Breakdown
    // If you're already filtering by department, you might skip
    // But here's an example that groups by department_name.
    const deptMap = {};
    resultRows.forEach(r => {
      const dname = r.department_name || "Unknown";
      if (!deptMap[dname]) {
        deptMap[dname] = { department_name: dname, count: 0, totalScore: 0 };
      }
      deptMap[dname].count++;
      deptMap[dname].totalScore += parseFloat(r.score) || 0;
    });
    const departmentBreakdown = Object.values(deptMap).map(d => {
      return {
        department_name: d.department_name,
        count: d.count,
        avgScore: d.totalScore / d.count
      };
    });

    // 6) Return aggregated data
    res.json({
      examInfo,
      countParticipants,
      minScore,
      maxScore,
      averageScore,
      distribution,
      departmentBreakdown,
      // If you want to list all resultRows or partial data, include:
      // rawResults: resultRows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
