"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MOVIES } from "@/lib/movies";

export default function MoviePage() {
  const { id } = useParams();
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const movie = MOVIES[id];

  useEffect(() => {
    // เช็คสิทธิ์ก่อนเข้าดู
    if (!localStorage.getItem("user")) {
      router.push("/login");
      return;
    }

    const BIN_ID = process.env.NEXT_PUBLIC_BIN_ID;
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
    const URL = `https://api.jsonbin.io/v3/b/69ea321faaba8821972d602b`;

    fetch(URL, { headers: { "X-Master-Key": API_KEY } })
      .then(res => res.json())
      .then(data => {
        setReviews(data.record.reviews || []);
        setLoading(false);
      });
  }, []);

  if (!movie) return <div className="container text-center"><h2>ไม่พบข้อมูลหนัง 😢</h2></div>;
  if (loading) return <div className="container text-center"><h2>กำลังโหลดข้อมูล... ⏳</h2></div>;

  const list = reviews.filter(r => r.movieId === Number(id));

  return (
    <div className="container">
      <button onClick={() => router.push("/")}>← กลับหน้าหลัก</button>

      <div className="card text-center" style={{ marginTop: 20 }}>
        <img src={movie.poster} alt={movie.title} style={{ width: 250, borderRadius: 10 }} />
        <h1>{movie.title}</h1>
      </div>

      <h2>ความคิดเห็นทั้งหมด ({list.length})</h2>
      
      {list.length === 0 ? (
        <p className="text-center" style={{ color: "gray" }}>ยังไม่มีรีวิวสำหรับหนังเรื่องนี้ เป็นคนแรกที่รีวิวสิ!</p>
      ) : (
        list.map(r => (
          <div className="card" key={r.id}>
            <div className="flex-between">
              <b>👤 {r.user}</b>
              <span style={{ color: "gold", fontSize: "1.2rem" }}>{"★".repeat(r.rating)}</span>
            </div>
            <p style={{ fontSize: "1.1rem", margin: "10px 0" }}>{r.comment}</p>
            <small style={{ color: "gray" }}>📅 {r.createdAt}</small>
          </div>
        ))
      )}
    </div>
  );
}