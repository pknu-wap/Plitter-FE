import "./CharacterLoading.css";

export default function CharacterCreatePage() {
  return (
    <main className="character-create-page">
      <header className="character-header">
        <h1>PLITTER</h1>
      </header>

      <div className="gradient-blob blob-orange" />
      <div className="gradient-blob blob-yellow" />
      <div className="gradient-blob blob-blue" />
      <div className="gradient-blob blob-pink" />
      <div className="gradient-blob blob-green" />
      <div className="gradient-blob blob-purple" />

      {/* 나중에 캐릭터 생성 UI 들어갈 자리 */}
      <section className="character-content"></section>
    </main>
  );
}