"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [name, setName] = useState("");
  const router = useRouter();

  function login() {
    if (!name.trim()) return alert("กรุณากรอกชื่อของคุณ");
    localStorage.setItem("user", name);
    router.push("/");
  }

  return (
    <div className="container" style={{ maxWidth: "400px", marginTop: "100px" }}>
      <div className="card text-center">
        <h2>🔒 เข้าสู่ระบบ</h2>
        <input
          placeholder="กรอกชื่อของคุณ..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
        />
        <button onClick={login} style={{ width: "100%" }}>เข้าใช้งาน</button>
      </div>
    </div>
  );
}