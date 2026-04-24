"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOVIES } from "@/lib/movies";

export default function Home() {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(true);
  
  // State สำหรับ Form (รวมการเพิ่มและแก้ไข)
  const [form, setForm] = useState({ movieId: 1, rating: 0, comment: "" });
  const [editId, setEditId] = useState(null); // เช็คว่ากำลังแก้ไขอยู่หรือไม่

  const BIN_ID = process.env.NEXT_PUBLIC_BIN_ID;
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
  const URL = `https://api.jsonbin.io/v3/b/69ea321faaba8821972d602b`;

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) {
      router.push("/login");
    } else {
      setUser(u);
      fetchData();
    }
  }, []);

  async function fetchData() {
    try {
      const res = await fetch(URL, { headers: { "X-Master-Key": API_KEY } });
      const data = await res.json();
      setReviews(data.record.reviews || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function syncData(newData) {
    try {
      await fetch(URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Master-Key": API_KEY },
        body: JSON.stringify({ reviews: newData })
      });
      setReviews(newData);
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  }

  // CREATE & UPDATE
  function handleSubmit() {
    if (!form.rating) return alert("กรุณาให้คะแนนดาว");
    if (!form.comment.trim()) return alert("กรุณาเขียนความคิดเห็น");

    let updatedReviews;

    if (editId) {
      // โหมด UPDATE (แก้ไข)
      updatedReviews = reviews.map(r => 
        r.id === editId ? { ...r, movieId: form.movieId, rating: form.rating, comment: form.comment } : r
      );
      setEditId(null);
    } else {
      // โหมด CREATE (เพิ่มใหม่)
      const newReview = {
        id: Date.now(),
        movieId: form.movieId,
        user: user,
        rating: form.rating,
        comment: form.comment,
        createdAt: new Date().toLocaleDateString("th-TH")
      };
      updatedReviews = [...reviews, newReview];
    }

    syncData(updatedReviews);
    setForm({ movieId: 1, rating: 0, comment: "" }); // Reset form
  }

  // DELETE
  function deleteReview(id) {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบรีวิวนี้?")) {
      const updatedReviews = reviews.filter(r => r.id !== id);
      syncData(updatedReviews);
    }
  }

  // เตรียมข้อมูลลง Form เพื่อแก้ไข
  function editReview(review) {
    setForm({ movieId: review.movieId, rating: review.rating, comment: review.comment });
    setEditId(review.id);
    window.scrollTo(0, 0); // เลื่อนขึ้นไปบนสุดที่ฟอร์ม
  }

  // ฟังก์ชันหาค่าเฉลี่ย
  function getAverage(movieId) {
    const list = reviews.filter(r => r.movieId === movieId);
    if (!list.length) return "ยังไม่มีคะแนน";
    return (list.reduce((a, b) => a + b.rating, 0) / list.length).toFixed(1);
  }

  function logout() {
    localStorage.removeItem("user");
    router.push("/login");
  }

  if (loading) return <div className="container text-center"><h2>กำลังโหลดข้อมูล... ⏳</h2></div>;

  return (
    <div className="container">
      <div className="flex-between">
        <h1>🎬 Movie Review System</h1>
        <div>
          <span>👤 {user} </span>
          <button className="danger" onClick={logout}>ออกจากระบบ</button>
        </div>
      </div>

      {/* ฟอร์มจัดการรีวิว (ใช้ร่วมกันทั้งเพิ่มและแก้ไข) */}
      <div className="card" style={{ borderTop: editId ? '5px solid #ffc107' : '5px solid #007bff' }}>
        <h3>{editId ? "✏️ แก้ไขรีวิว" : "📝 เพิ่มรีวิวใหม่"}</h3>
        
        <select value={form.movieId} onChange={e => setForm({ ...form, movieId: Number(e.target.value) })}>
          {Object.entries(MOVIES).map(([id, m]) => (
            <option key={id} value={id}>{m.title}</option>
          ))}
        </select>

        <div className="stars" style={{ margin: "10px 0" }}>
          {[1,2,3,4,5].map(n => (
            <span key={n}
              onClick={() => setForm({ ...form, rating: n })}
              className={form.rating >= n ? "active" : ""}>
              ★
            </span>
          ))}
        </div>

        <input
          placeholder="เขียนความคิดเห็นของคุณ..."
          value={form.comment}
          onChange={e => setForm({ ...form, comment: e.target.value })}
        />

        <button onClick={handleSubmit} className={editId ? "warning" : ""}>
          {editId ? "บันทึกการแก้ไข" : "ส่งรีวิว"}
        </button>
        {editId && (
          <button onClick={() => { setEditId(null); setForm({ movieId: 1, rating: 0, comment: "" }); }}>
            ยกเลิก
          </button>
        )}
      </div>

      <hr style={{ margin: "30px 0", borderColor: "#ddd" }} />

      {/* รายการหนังทั้งหมด */}
      <h2>เลือกดูหนัง</h2>
      <div className="movie-grid">
        {Object.entries(MOVIES).map(([id, m]) => {
          const movieIdNum = Number(id);
          const avg = getAverage(movieIdNum);
          const reviewCount = reviews.filter(r => r.movieId === movieIdNum).length;

          return (
            <div className="movie-card" key={id}>
              <Link href={`/movie/${id}`}>
                <img src={m.poster} alt={m.title} />
                <div style={{ padding: "10px" }}>
                  <h2>{m.title}</h2>
                  <p>⭐ {avg}</p>
                  <small style={{ color: "gray" }}>({reviewCount} รีวิว)</small>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* แสดงรีวิวของตัวเอง (My Reviews) */}
      <h2 style={{ marginTop: "40px" }}>รีวิวของคุณ</h2>
      {reviews.filter(r => r.user === user).length === 0 ? (
        <p>คุณยังไม่ได้รีวิวหนังเรื่องใดเลย</p>
      ) : (
        reviews.filter(r => r.user === user).map(r => (
          <div className="card flex-between" key={r.id}>
            <div>
              <b>{MOVIES[r.movieId]?.title}</b> <span style={{ color: "gold" }}>{"★".repeat(r.rating)}</span>
              <p>{r.comment}</p>
              <small>{r.createdAt}</small>
            </div>
            <div>
              <button className="warning" onClick={() => editReview(r)}>แก้ไข</button>
              <button className="danger" onClick={() => deleteReview(r.id)}>ลบ</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}