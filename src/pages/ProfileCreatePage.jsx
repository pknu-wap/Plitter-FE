import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileCreatePage.css";
import plusIcon from "../assets/plus.png";

export default function ProfileCreatePage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");

  const handleNext = () => {
    navigate("/profile-share");
  };

  return (
    <main className="profile-create-page">
      <header className="profile-create-header">
        <h1>FIND YOUR NUMBER 18</h1>
      </header>

      <section className="profile-create-title">
        <h2>프로필을 등록해주세요!</h2>
        <p>프로필 사진과 이름을 추가해서 당신의 바이브를 보여주세요!</p>
      </section>

      <section className="profile-image-section">
        <button type="button" className="profile-image-button">
            <span className="profile-plus-button">
                <img src={plusIcon} alt="프로필 사진 추가" />
            </span>
        </button>
      </section>
 
      <section className="nickname-section">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={15}
          placeholder="닉네임을 입력해주세요"
          className="nickname-input"
        />

        <p className="nickname-guide">• 한글/영문/숫자 최대 15자 이내</p>
      </section>

      <button type="button" className="next-button" onClick={handleNext}>
        다음으로
      </button>
    </main>
  );
}