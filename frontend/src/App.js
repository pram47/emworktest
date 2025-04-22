import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [results, setResults] = useState([]);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    color_blindness: false,
    far_vision: false,
    astigmatism: false,
    reaction: false,
    traffic_signs_score: 0,
    road_lines_score: 0,
    right_of_way_score: 0,
    practical_passed: false,
  });
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dailyStats, setDailyStats] = useState({});


  const fetchResults = () => {
    axios.get('http://localhost:3001/api/results').then((res) => {
      setResults(res.data);
      calculateDailyStats(res.data); 
    });
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleSubmit = () => {
    const payload = {
      first_name: form.first_name || null, 
      last_name: form.last_name || null, 
      color_blindness_test: form.color_blindness ? 1 : 0,
      long_sightedness_test: form.far_vision ? 1 : 0,
      astigmatism_test: form.astigmatism ? 1 : 0,
      body_reaction_test: form.reaction ? 1 : 0,
      traffic_signs_score: form.traffic_signs_score || null, 
      road_lines_score: form.road_lines_score || null, 
      right_of_way_score: form.right_of_way_score || null, 
      practical_test_result: form.practical_passed ? 1 : 0,
    };

    const apiCall = editingId
      ? axios.put(`http://localhost:3001/api/results/${editingId}`, payload)
      : axios.post('http://localhost:3001/api/results', payload);

    apiCall.then(() => {
      fetchResults();
      setForm({
        first_name: '',
        last_name: '',
        color_blindness: false,
        far_vision: false,
        astigmatism: false,
        reaction: false,
        traffic_signs_score: 0,
        road_lines_score: 0,
        right_of_way_score: 0,
        practical_passed: false,
      });
      setEditingId(null);
    });
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:3001/api/results/${id}`).then(fetchResults);
  };

  const handleEdit = (item) => {
    setForm({
      first_name: item.first_name || '',
      last_name: item.last_name || '',
      color_blindness: item.color_blindness_test === 1,
      far_vision: item.long_sightedness_test === 1,
      astigmatism: item.astigmatism_test === 1,
      reaction: item.body_reaction_test === 1,
      traffic_signs_score: item.traffic_signs_score || 0,
      road_lines_score: item.road_lines_score || 0,
      right_of_way_score: item.right_of_way_score || 0,
      practical_passed: item.practical_test_result === 1,
    });
    setEditingId(item.id);
  };


  const calculateDailyStats = (data) => {
    const stats = {};
    data.forEach(item => {
      const date = new Date(item.created_at).toLocaleDateString();
      const status = getTestStatus(item);
      if (!stats[date]) {
        stats[date] = { passed: 0, failed: 0 };
      }
      if (status === 'ผ่านการทดสอบ') {
        stats[date].passed += 1;
      } else {
        stats[date].failed += 1;
      }
    });
    setDailyStats(stats);
  };



  const getTestStatus = (item) => {
    // ตรวจสอบค่าว่างหรือ null
    const requiredFields = [
      item.first_name,
      item.last_name,
      item.traffic_signs_score,
      item.road_lines_score,
      item.right_of_way_score,
    ];

    const hasEmpty = requiredFields.some((val) => val === null || val === undefined);

    if (hasEmpty) {
      return 'รอพิจารณา';
    }

    // ตรวจสอบผ่านร่างกาย (>= 3 ผ่านจาก 4)
    const bodyTests = [
      item.color_blindness_test,
      item.long_sightedness_test,
      item.astigmatism_test,
      item.body_reaction_test,
    ];
    const bodyPassed = bodyTests.filter((val) => val === 1).length >= 3;

    // ตรวจสอบทฤษฎี (>= 80%)
    const theoryTotal = item.traffic_signs_score + item.road_lines_score + item.right_of_way_score;
    const theoryPassed = theoryTotal >= 120;

    // ตรวจสอบภาคปฏิบัติ
    const practicalPassed = item.practical_test_result === 1;

    // ถ้าทั้ง 3 ผ่าน
    if (bodyPassed && theoryPassed && practicalPassed) {
      return 'ผ่านการทดสอบ';
    }

    // ถ้ามีข้อใดข้อหนึ่งไม่ผ่าน
    return 'ไม่ผ่านการทดสอบ';
  };


  const filteredResults = results.filter((r) =>
    r.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: 20 }}>
      <h2>ระบบบันทึกผลการสอบใบขับขี่</h2>
      <h3>ค้นหาผู้เข้าสอบ</h3>
        <input
          placeholder="ค้นหาชื่อหรือนามสกุล"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

      <h3>จำนวนผู้ผ่านทดสอบและไม่ผ่านการทดสอบ</h3>
      {Object.keys(dailyStats).map(date => (
        <div key={date}>
          <strong>{date}:</strong> ผ่าน {dailyStats[date].passed} | ไม่ผ่าน {dailyStats[date].failed}
        </div>
      ))}
      <h3>ข้อมูลผู้เข้าสอบ</h3>
      <input
        placeholder="ชื่อ"
        value={form.first_name}
        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
      />
      <input
        placeholder="นามสกุล"
        value={form.last_name}
        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
      />

      <h3>ทดสอบร่างกาย (เลือกอย่างน้อย 3 ผ่าน)</h3>
      <label>
        <input
          type="checkbox"
          checked={form.color_blindness}
          onChange={(e) => setForm({ ...form, color_blindness: e.target.checked })}
        />
        ตาบอดสี
      </label>
      <label>
        <input
          type="checkbox"
          checked={form.far_vision}
          onChange={(e) => setForm({ ...form, far_vision: e.target.checked })}
        />
        สายตายาว
      </label>
      <label>
        <input
          type="checkbox"
          checked={form.astigmatism}
          onChange={(e) => setForm({ ...form, astigmatism: e.target.checked })}
        />
        สายตาเอียง
      </label>
      <label>
        <input
          type="checkbox"
          checked={form.reaction}
          onChange={(e) => setForm({ ...form, reaction: e.target.checked })}
        />
        การตอบสนอง
      </label>

      <h3>ทดสอบทฤษฎี (เกิน 80% ถือว่าผ่าน)</h3>
      <input
        type="number"
        placeholder="ป้ายจราจร (เต็ม 50)"
        value={form.traffic_signs_score || ''}
        onChange={(e) => {
          const value = parseInt(e.target.value) || 0;
          setForm({ ...form, traffic_signs_score: value > 50 ? 50 : value });
        }}
      />
      <input
        type="number"
        placeholder="เส้นจราจร (เต็ม 50)"
        value={form.road_lines_score || ''}
        onChange={(e) => {
          const value = parseInt(e.target.value) || 0;
          setForm({ ...form, road_lines_score: value > 50 ? 50 : value });
        }}
      />
      <input
        type="number"
        placeholder="การให้ทาง (เต็ม 50)"
        value={form.right_of_way_score || ''}
        onChange={(e) => {
          const value = parseInt(e.target.value) || 0;
          setForm({ ...form, right_of_way_score: value > 50 ? 50 : value });
        }}
      />

      <h3>ผลสอบภาคปฏิบัติ</h3>
      <label>
        <input
          type="checkbox"
          checked={form.practical_passed}
          onChange={(e) => setForm({ ...form, practical_passed: e.target.checked })}
        />
        ผ่าน
      </label>

      <button onClick={handleSubmit}>{editingId ? 'อัปเดต' : 'บันทึก'}</button>

      <hr />

      <table border="1">
        <thead>
          <tr>
            <th>สถานะ</th>
            <th>ชื่อ</th>
            <th>นามสกุล</th>
            <th>ทฤษฎี</th>
            <th>ปฏิบัติ</th>
            <th>ทดสอบร่างกาย</th>
            <th>เวลา</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {filteredResults.map((r) => (
            <tr key={r.id}>
              <td>{getTestStatus(r)}</td>
              <td>{r.first_name}</td>
              <td>{r.last_name}</td>
              <td>
                {r.traffic_signs_score + r.road_lines_score + r.right_of_way_score >= 120
                  ? 'ผ่าน'
                  : 'ไม่ผ่าน'}
              </td>

              <td>{r.practical_test_result ? 'ผ่าน' : 'ไม่ผ่าน'}</td>
              <td>
                {r.color_blindness_test +
                r.long_sightedness_test +
                r.astigmatism_test +
                r.body_reaction_test >= 3
                  ? 'ผ่าน'
                  : 'ไม่ผ่าน'}
              </td>
              <td>{new Date(r.created_at).toLocaleString()}</td>
              <td>
                <button onClick={() => handleEdit(r)}>แก้ไข</button>
                <button onClick={() => handleDelete(r.id)}>ลบ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;