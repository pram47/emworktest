const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'driving_license'
});

// get all results111
app.get('/api/results', (req, res) => {
    db.query('SELECT * FROM test_results', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// create a new result
app.post('/api/results', (req, res) => {
    const {
        first_name,
        last_name,
        color_blindness_test,
        long_sightedness_test,
        astigmatism_test,
        body_reaction_test,
        traffic_signs_score,
        road_lines_score,
        right_of_way_score,
        practical_test_result,
        vision_test_result
    } = req.body;

    const sql = `
        INSERT INTO test_results (
            first_name, last_name,
            color_blindness_test, long_sightedness_test, astigmatism_test, body_reaction_test,
            traffic_signs_score, road_lines_score, right_of_way_score,
            practical_test_result, vision_test_result
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        first_name, last_name,
        color_blindness_test, long_sightedness_test, astigmatism_test, body_reaction_test,
        traffic_signs_score, road_lines_score, right_of_way_score,
        practical_test_result, vision_test_result
    ];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ id: result.insertId });
    });
});

// update a result
app.put('/api/results/:id', (req, res) => {
    const { id } = req.params;
    const {
        first_name,
        last_name,
        color_blindness_test,
        long_sightedness_test,
        astigmatism_test,
        body_reaction_test,
        traffic_signs_score,
        road_lines_score,
        right_of_way_score,
        practical_test_result
    } = req.body;

    db.query(`
        UPDATE test_results SET 
            first_name = ?, 
            last_name = ?, 
            color_blindness_test = ?, 
            long_sightedness_test = ?, 
            astigmatism_test = ?, 
            body_reaction_test = ?, 
            traffic_signs_score = ?, 
            road_lines_score = ?, 
            right_of_way_score = ?, 
            practical_test_result = ?,
            created_at = NOW()
        WHERE id = ?`,
        [
            first_name,
            last_name,
            color_blindness_test,
            long_sightedness_test,
            astigmatism_test,
            body_reaction_test,
            traffic_signs_score,
            road_lines_score,
            right_of_way_score,
            practical_test_result,
            id
        ],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json(result);
        }
    );
});

// delete a result
app.delete('/api/results/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM test_results WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

app.listen(3001, () => console.log('Server running on http://localhost:3001'));
